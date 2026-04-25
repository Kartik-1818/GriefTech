import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { buildChecklist, scanAssets, DOC_CATALOG, mockEpfoLookup, iepfLookup, panicActions, validateAadhaar, validatePincode, CHECKLIST_TEMPLATE } from '@/lib/demo';
import { generatePdf } from '@/lib/pdf';
import { getOfficesNear } from '@/lib/offices';
import { STRINGS } from '@/lib/i18n';

let _client = null;
async function db() {
  if (!_client) {
    _client = new MongoClient(process.env.MONGO_URL);
    await _client.connect();
  }
  return _client.db(process.env.DB_NAME || 'grieftech');
}

function ok(data, status = 200) { return NextResponse.json(data, { status }); }
function err(msg, status = 400) { return NextResponse.json({ error: msg }, { status }); }

async function callLLM(messages, max_tokens = 600) {
  const resp = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-5-20250929', messages, max_tokens })
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error('LLM gateway: ' + t); }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function handle(request, { params }) {
  const path = (params?.path || []).join('/');
  const method = request.method;

  try {
    if (path === 'onboard' && method === 'POST') {
      const body = await request.json();
      if (!body?.deceasedName || !body?.dateOfDeath || !body?.relationship) {
        return err('deceasedName, dateOfDeath, relationship are required');
      }
      if (!validateAadhaar(body.aadhaar)) return err('Aadhaar must be 12 digits');
      if (!validatePincode(body.pincode)) return err('PIN code must be 6 digits');

      const sessionId = uuidv4();
      const profile = {
        sessionId,
        deceasedName: body.deceasedName,
        dateOfDeath: body.dateOfDeath,
        aadhaar: String(body.aadhaar).replace(/\s+/g, ''),
        pincode: String(body.pincode).trim(),
        state: body.state || null,
        city: body.city || null,
        claimantName: body.claimantName || null,
        relationship: body.relationship,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        language: body.language || 'en',
        assets: body.assets || {},
        createdAt: new Date().toISOString()
      };
      const checklist = buildChecklist(profile);
      const d = await db();
      await d.collection('sessions').insertOne({ _id: sessionId, profile, checklist, chat: [] });
      return ok({ sessionId, profile });
    }

    if (path.startsWith('session/') && method === 'GET') {
      const id = path.split('/')[1];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      return ok({ profile: s.profile, checklist: s.checklist });
    }

    if (path.startsWith('checklist/') && method === 'GET') {
      const id = path.split('/')[1];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      return ok({ checklist: s.checklist });
    }
    if (path === 'checklist/toggle' && method === 'POST') {
      const { sessionId, taskId } = await request.json();
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: sessionId });
      if (!s) return err('Session not found', 404);
      const cl = (s.checklist || []).map(t => t.id === taskId ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t);
      await d.collection('sessions').updateOne({ _id: sessionId }, { $set: { checklist: cl } });
      return ok({ checklist: cl });
    }

    if (path.startsWith('assets/scan/') && method === 'GET') {
      const id = path.split('/')[2];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      const assets = scanAssets(s.profile);
      return ok({ assets, count: assets.length });
    }

    if (path === 'epfo-lookup' && method === 'POST') {
      const { uan } = await request.json();
      const result = await mockEpfoLookup(uan);
      return ok(result);
    }

    if (path === 'iepf-lookup' && method === 'POST') {
      const { name, dob } = await request.json();
      const result = await iepfLookup(name, dob);
      return ok(result);
    }

    // Offices nearest to a PIN. Either ?pin=411014 or by sessionId.
    if (path === 'offices' && method === 'GET') {
      const url = new URL(request.url);
      let pin = url.searchParams.get('pin');
      const sid = url.searchParams.get('sessionId');
      if (!pin && sid) {
        const d = await db();
        const s = await d.collection('sessions').findOne({ _id: sid });
        pin = s?.profile?.pincode;
      }
      if (!pin) return err('pin or sessionId required');
      const result = getOfficesNear(pin);
      if (!result) return err('Invalid PIN code', 400);
      return ok(result);
    }

    if (path.startsWith('panic/') && method === 'GET') {
      const id = path.split('/')[1];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      // Hydrate the actions with localised title + plain (English fallback for now — the UI re-localises)
      const result = panicActions(s.profile, s.checklist);
      const lang = s.profile?.language || 'en';
      const T = STRINGS[lang] || STRINGS.en;
      result.actions = result.actions.map(a => ({
        ...a,
        title: T[a.titleKey] || STRINGS.en[a.titleKey] || a.titleKey,
        plain: T[a.descKey] || STRINGS.en[a.descKey] || a.descKey
      }));
      return ok(result);
    }

    if (path === 'extract-document' && method === 'POST') {
      const { imageBase64, mimeType, docType } = await request.json();
      if (!imageBase64) return err('imageBase64 is required');
      const prompt = `You are an OCR extractor for Indian official documents. Extract STRICT JSON with keys name, father_or_husband_name, date_of_birth, date_of_death, place_of_death, gender, document_type. Use null when not visible.`;
      try {
        const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
        const reply = await callLLM([
          { role: 'system', content: prompt },
          { role: 'user', content: [
            { type: 'text', text: 'Extract the fields from this document.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]}
        ], 400);
        const m = reply.match(/\{[\s\S]*\}/);
        const parsed = m ? JSON.parse(m[0]) : null;
        if (parsed) return ok({ extracted: parsed, source: 'ai' });
      } catch (e) { /* fall through */ }
      return ok({
        extracted: {
          name: 'Ramesh Kumar Sharma',
          father_or_husband_name: 'Late Mohan Lal Sharma',
          date_of_birth: '1958-08-14',
          date_of_death: '2025-05-01',
          place_of_death: 'Pune, Maharashtra',
          gender: 'M',
          document_type: docType || 'death_certificate'
        }, source: 'demo'
      });
    }

    if (path === 'documents' && method === 'GET') return ok({ catalog: DOC_CATALOG });
    if (path.startsWith('document/') && method === 'GET') {
      const [, docKey, id] = path.split('/');
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      const buf = await generatePdf(docKey, s.profile);
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="grieftech-${docKey}.pdf"`
        }
      });
    }

    if (path === 'chat' && method === 'POST') {
      const { sessionId, message, language } = await request.json();
      if (!message) return err('message is required');
      const d = await db();
      const s = sessionId ? await d.collection('sessions').findOne({ _id: sessionId }) : null;
      const profile = s?.profile || {};
      const history = (s?.chat || []).slice(-10);
      const lang = language || profile.language || 'en';

      const system = `You are a calm Indian assistant helping families after a loss.\nRULES (follow strictly):\n1. First acknowledge the emotion in ONE short, warm sentence. Never robotic.\n2. Then give exactly ONE clear next step. No long lectures.\n3. Use simple ${lang === 'hi' ? 'Hindi (Devanagari script)' : 'English'} — no legal jargon.\n4. Never mention any rupee/money figure. Talk only about asset *types* ("the EPF", "the policy").\n5. Refer to the deceased respectfully by name.\n6. Reply must be under 130 words. Use short bullets if helpful.\n\nUSER PROFILE:\n- Deceased: ${profile.deceasedName || 'unknown'}\n- Date of death: ${profile.dateOfDeath || 'unknown'}\n- Claimant relation: ${profile.relationship || 'family'}\n- State: ${profile.state || 'India'}\n- City: ${profile.city || ''}\n- PIN: ${profile.pincode || ''}\n- Known assets: ${JSON.stringify(profile.assets || {})}`;

      const messages = [
        { role: 'system', content: system },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      let reply;
      try { reply = await callLLM(messages, 500); }
      catch (e) { return err('LLM error: ' + e.message, 502); }
      if (!reply) reply = lang === 'hi' ? 'मैं आपके साथ हूं। गहरी सांस लें — एक-एक कदम करेंगे।' : 'I am here for you. Take a breath — we will go one step at a time.';

      if (sessionId && s) {
        const newChat = [...(s.chat || []),
          { role: 'user', content: message, ts: Date.now() },
          { role: 'assistant', content: reply, ts: Date.now() }];
        await d.collection('sessions').updateOne({ _id: sessionId }, { $set: { chat: newChat } });
      }
      return ok({ reply });
    }

    return err('Not found: ' + path, 404);
  } catch (e) {
    console.error('API error', e);
    return err(e.message || 'Server error', 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
