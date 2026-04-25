import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { buildChecklist, scanAssets, DOC_CATALOG, mockEpfoLookup, panicActions } from '@/lib/demo';
import { generatePdf } from '@/lib/pdf';

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
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error('LLM gateway: ' + t);
  }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function handle(request, { params }) {
  const path = (params?.path || []).join('/');
  const method = request.method;

  try {
    // ---------- ONBOARD ----------
    if (path === 'onboard' && method === 'POST') {
      const body = await request.json();
      if (!body?.deceasedName || !body?.dateOfDeath || !body?.relationship) {
        return err('deceasedName, dateOfDeath, relationship are required');
      }
      const sessionId = uuidv4();
      const profile = {
        sessionId,
        deceasedName: body.deceasedName,
        dateOfDeath: body.dateOfDeath,
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

    // ---------- SESSION ----------
    if (path.startsWith('session/') && method === 'GET') {
      const id = path.split('/')[1];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      return ok({ profile: s.profile, checklist: s.checklist });
    }

    // ---------- CHECKLIST ----------
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

    // ---------- ASSET SCAN ----------
    if (path.startsWith('assets/scan/') && method === 'GET') {
      const id = path.split('/')[2];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      const assets = scanAssets(s.profile);
      return ok({ assets, count: assets.length });
    }

    // ---------- EPFO LOOKUP (Magic Insight) ----------
    if (path === 'epfo-lookup' && method === 'POST') {
      const { uan } = await request.json();
      const result = mockEpfoLookup(uan);
      return ok(result);
    }

    // ---------- PANIC — "What should I do now?" ----------
    if (path.startsWith('panic/') && method === 'GET') {
      const id = path.split('/')[1];
      const d = await db();
      const s = await d.collection('sessions').findOne({ _id: id });
      if (!s) return err('Session not found', 404);
      const result = panicActions(s.profile, s.checklist);
      return ok(result);
    }

    // ---------- DOCUMENT EXTRACTION (upload → auto-fill) ----------
    if (path === 'extract-document' && method === 'POST') {
      const { imageBase64, mimeType, docType } = await request.json();
      if (!imageBase64) return err('imageBase64 is required');

      // Try Claude vision via Emergent gateway. If it fails, fallback to demo data.
      const prompt = `You are an OCR extractor for Indian official documents (death certificate, Aadhaar, PAN, hospital medical certificate). Extract the following fields strictly as JSON. Use null when a field is not visible.\n\nReturn ONLY valid JSON, no prose:\n{\n  "name": string|null,            // full name of the deceased / holder\n  "father_or_husband_name": string|null,\n  "date_of_birth": string|null,   // YYYY-MM-DD\n  "date_of_death": string|null,   // YYYY-MM-DD\n  "place_of_death": string|null,\n  "gender": "M"|"F"|null,\n  "document_type": "death_certificate"|"aadhaar"|"pan"|"medical_certificate"|"unknown"\n}`;

      try {
        const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
        const reply = await callLLM([
          { role: 'system', content: prompt },
          { role: 'user', content: [
            { type: 'text', text: 'Extract the fields from this document.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]}
        ], 400);
        // Try to parse JSON from reply
        const m = reply.match(/\{[\s\S]*\}/);
        const parsed = m ? JSON.parse(m[0]) : null;
        if (parsed) return ok({ extracted: parsed, source: 'ai' });
      } catch (e) {
        // fall through to demo
      }
      // Fallback (demo mode) — deterministic mock
      return ok({
        extracted: {
          name: 'Ramesh Kumar Sharma',
          father_or_husband_name: 'Late Mohan Lal Sharma',
          date_of_birth: '1958-08-14',
          date_of_death: '2025-05-01',
          place_of_death: 'Pune, Maharashtra',
          gender: 'M',
          document_type: docType || 'death_certificate'
        },
        source: 'demo'
      });
    }

    // ---------- DOCUMENTS ----------
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

    // ---------- CHAT (Claude via Emergent) ----------
    if (path === 'chat' && method === 'POST') {
      const { sessionId, message, language } = await request.json();
      if (!message) return err('message is required');
      const d = await db();
      const s = sessionId ? await d.collection('sessions').findOne({ _id: sessionId }) : null;
      const profile = s?.profile || {};
      const history = (s?.chat || []).slice(-10);

      const system = `You are a calm Indian assistant helping families after a loss. RULES (follow strictly):\n1. First acknowledge the emotion in ONE short, warm sentence. Never robotic.\n2. Then give exactly ONE clear next step. No long lectures.\n3. Use simple ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'} — no legal jargon.\n4. Never mention any rupee/money figure. Talk only about asset *types* ("the EPF", "the policy").\n5. Refer to the deceased respectfully by name.\n6. Reply must be under 130 words. Use short bullets if helpful.\n\nUSER PROFILE:\n- Deceased: ${profile.deceasedName || 'unknown'}\n- Date of death: ${profile.dateOfDeath || 'unknown'}\n- Claimant relation: ${profile.relationship || 'family'}\n- State: ${profile.state || 'India'}\n- City: ${profile.city || ''}\n- Known assets: ${JSON.stringify(profile.assets || {})}`;

      const messages = [
        { role: 'system', content: system },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      let reply;
      try {
        reply = await callLLM(messages, 500);
      } catch (e) {
        return err('LLM error: ' + e.message, 502);
      }
      if (!reply) reply = 'I am here for you. Take a breath — we will go one step at a time.';

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

// Allow larger payloads for document uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
