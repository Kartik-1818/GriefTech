'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Loader2, Heart, Upload, Sparkles, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

const RELATIONS = ['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Other'];
const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Other'];

export default function Start() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [epfChecking, setEpfChecking] = useState(false);
  const [epfResult, setEpfResult] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    deceasedName: '', dateOfDeath: '', state: '', city: '',
    claimantName: '', relationship: '', phone: '', email: '', address: '',
    assets: { uan: '', banks: false, policies: false, property: false, mutualFunds: false, notSure: false }
  });

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function updateAsset(k, v) { setForm(f => ({ ...f, assets: { ...f.assets, [k]: v } })); }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true); setExtracted(null);
    try {
      const buf = await file.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      const r = await fetch('/api/extract-document', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mimeType: file.type, docType: 'death_certificate' })
      }).then(r => r.json());
      if (r?.extracted) {
        setExtracted(r.extracted);
        // Auto-fill
        setForm(f => ({
          ...f,
          deceasedName: r.extracted.name || f.deceasedName,
          dateOfDeath: r.extracted.date_of_death || f.dateOfDeath,
          state: f.state || (r.extracted.place_of_death || '').split(',').pop()?.trim() || f.state
        }));
        toast.success(r.source === 'ai' ? 'Document read — fields filled' : 'Demo data loaded');
      }
    } catch (err) { toast.error('Could not read the document.'); }
    finally { setExtracting(false); }
  }

  async function checkUAN(uan) {
    if (!uan || uan.length < 10) { setEpfResult(null); return; }
    setEpfChecking(true);
    try {
      const r = await fetch('/api/epfo-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uan }) }).then(r => r.json());
      setEpfResult(r);
    } finally { setEpfChecking(false); }
  }

  const canNext = (step === 1 && form.deceasedName && form.dateOfDeath)
    || (step === 2 && form.relationship)
    || (step === 3);

  async function submit() {
    setLoading(true);
    try {
      const r = await fetch('/api/onboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('gt_session', data.sessionId);
      toast.success('Your personalised plan is ready.');
      router.push('/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen gt-gradient">
      <nav className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#028090] flex items-center justify-center text-white font-bold">G</div>
          <span className="font-semibold">GriefTech</span>
        </Link>
        <div className="text-xs text-slate-500">Step {step} of 3</div>
      </nav>

      <section className="max-w-xl mx-auto px-5 py-8">
        <div className="h-1.5 w-full bg-[#EDE7DC] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-[#028090] transition-all" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <div className="gt-card p-6 md:p-8 gt-fade-up">
          <div className="flex items-center gap-2 text-[#028090] text-sm mb-2"><Heart className="h-4 w-4" /> We are gentle with every detail.</div>

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">Tell us about the deceased.</h1>
              <p className="text-sm text-slate-500 mb-4">Or upload the death certificate — we'll auto-fill everything.</p>

              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={extracting}
                className="w-full mb-4 rounded-xl border-2 border-dashed border-[#028090]/40 bg-[#E1EFEF]/50 p-4 hover:bg-[#E1EFEF] flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                  {extracting ? <Loader2 className="h-5 w-5 animate-spin text-[#028090]" /> : <Upload className="h-5 w-5 text-[#028090]" />}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#014f5a]">{extracting ? 'Reading document…' : 'Upload death certificate / Aadhaar'}</div>
                  <div className="text-xs text-slate-600">We'll OCR the document and pre-fill these fields</div>
                </div>
              </button>

              {extracted && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Document read</div>
                    <div className="text-xs">Name & dates filled below — review and edit if needed.</div>
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium mb-1">Name of the deceased</label>
              <input className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring mb-4"
                placeholder="e.g. Ramesh Kumar" value={form.deceasedName} onChange={e => update('deceasedName', e.target.value)} />
              <label className="block text-sm font-medium mb-1">Date of passing</label>
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring mb-4"
                value={form.dateOfDeath} onChange={e => update('dateOfDeath', e.target.value)} />
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring bg-white"
                    value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select…</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring"
                    placeholder="e.g. Pune" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">A little about you.</h1>
              <p className="text-sm text-slate-500 mb-4">So we can personalise the forms and reach you safely.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Your name</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring"
                    placeholder="Full name as per Aadhaar" value={form.claimantName} onChange={e => update('claimantName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring"
                    placeholder="+91 …" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
              <label className="block text-sm font-medium mb-1 mt-3">Email</label>
              <input className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring"
                placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              <label className="block text-sm font-medium mb-1 mt-3">Address</label>
              <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-[#E1EFEF] gt-ring"
                placeholder="Where can we send paperwork notifications?" value={form.address} onChange={e => update('address', e.target.value)} />
              <label className="block text-sm font-medium mb-1 mt-3">Your relationship to the deceased</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONS.map(r => (
                  <button key={r} type="button" onClick={() => update('relationship', r)}
                    className={`px-4 py-2 rounded-full text-sm border ${form.relationship === r ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white border-[#E1EFEF] text-slate-700 hover:border-[#028090]'}`}>{r}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">What was in their name?</h1>
              <p className="text-sm text-slate-500 mb-4">Tick what you know. We'll find the rest.</p>

              <label className="block text-sm font-medium mb-1">EPF UAN (12 digits) — we'll detect the employer instantly</label>
              <div className="relative mb-2">
                <input className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E1EFEF] gt-ring"
                  placeholder="e.g. 100200300400" value={form.assets.uan}
                  onChange={e => { updateAsset('uan', e.target.value); checkUAN(e.target.value); }} />
                {epfChecking && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#028090]" />}
                {!epfChecking && epfResult?.found && <CheckCircle2 className="absolute right-3 top-3.5 h-4 w-4 text-emerald-600" />}
              </div>
              {epfResult?.found && (
                <div className="mb-4 rounded-xl border border-[#028090]/30 bg-[#E1EFEF] p-3">
                  <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold flex items-center gap-1"><Sparkles className="h-3 w-3" /> Magic detection</div>
                  <div className="font-semibold text-[#014f5a]">EPF account detected</div>
                  <div className="text-xs text-slate-700">Employer: <b>{epfResult.employer}</b> · Member ID {epfResult.member_id}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'banks', l: 'Bank accounts / FDs' },
                  { k: 'policies', l: 'Life insurance policies' },
                  { k: 'property', l: 'Property / land' },
                  { k: 'mutualFunds', l: 'Shares / mutual funds' }
                ].map(o => (
                  <label key={o.k} className={`px-4 py-3 rounded-xl border flex items-center gap-2 cursor-pointer ${form.assets[o.k] ? 'bg-[#E1EFEF] border-[#028090]' : 'bg-white border-[#E1EFEF]'}`}>
                    <input type="checkbox" checked={!!form.assets[o.k]} onChange={e => updateAsset(o.k, e.target.checked)} />
                    <span className="text-sm">{o.l}</span>
                  </label>
                ))}
              </div>
              <label className={`mt-3 block px-4 py-3 rounded-xl border flex items-center gap-2 cursor-pointer ${form.assets.notSure ? 'bg-[#E1EFEF] border-[#028090]' : 'bg-white border-[#E1EFEF]'}`}>
                <input type="checkbox" checked={!!form.assets.notSure} onChange={e => updateAsset('notSure', e.target.checked)} />
                <span className="text-sm">I'm not sure — please scan all sources for me</span>
              </label>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="text-sm text-slate-500 inline-flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
                className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2 disabled:opacity-50">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Build my plan
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
