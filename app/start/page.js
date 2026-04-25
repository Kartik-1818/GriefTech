'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Loader2, Heart, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import LanguageToggle from '@/components/LanguageToggle';
import { t, getLang } from '@/lib/i18n';
import { validateAadhaar, validatePincode } from '@/lib/demo';

const RELATIONS_KEYS = [
  { en: 'Spouse', hi: 'जीवनसाथी' },
  { en: 'Son', hi: 'पुत्र' },
  { en: 'Daughter', hi: 'पुत्री' },
  { en: 'Parent', hi: 'माता/पिता' },
  { en: 'Sibling', hi: 'भाई/बहन' },
  { en: 'Other', hi: 'अन्य' }
];
const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Other'];

export default function Start() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [epfChecking, setEpfChecking] = useState(false);
  const [epfResult, setEpfResult] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    deceasedName: '', dateOfDeath: '', state: '', city: '',
    aadhaar: '', pincode: '',
    claimantName: '', relationship: '', phone: '', email: '', address: '',
    assets: { uan: '', banks: false, policies: false, property: false, mutualFunds: false, notSure: false }
  });

  useEffect(() => { setLang(getLang()); }, []);
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
        setForm(f => ({
          ...f,
          deceasedName: r.extracted.name || f.deceasedName,
          dateOfDeath: r.extracted.date_of_death || f.dateOfDeath,
          state: f.state || (r.extracted.place_of_death || '').split(',').pop()?.trim() || f.state
        }));
        toast.success(r.source === 'ai' ? t('start.doc_read', lang) : 'Demo data loaded');
      }
    } catch { toast.error('Could not read the document.'); }
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

  const aadhaarOk = validateAadhaar(form.aadhaar);
  const pinOk = validatePincode(form.pincode);
  const canNext = (step === 1 && form.deceasedName && form.dateOfDeath && aadhaarOk && pinOk)
    || (step === 2 && form.relationship)
    || (step === 3);

  async function submit() {
    if (!aadhaarOk) { toast.error(t('start.invalid_aadhaar', lang)); return; }
    if (!pinOk) { toast.error(t('start.invalid_pincode', lang)); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/onboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('gt_session', data.sessionId);
      toast.success(lang === 'hi' ? 'आपकी योजना तैयार है।' : 'Your personalised plan is ready.');
      router.push('/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen gt-gradient">
      <nav className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#028090] to-[#03A9B3] flex items-center justify-center text-white font-bold shadow-md">G</div>
          <span className="font-semibold tracking-tight">{t('common.app_name', lang)}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">{t('start.step_of', lang).replace('{n}', step)}</div>
          <LanguageToggle />
        </div>
      </nav>

      <section className="max-w-xl mx-auto px-5 py-8">
        <div className="h-1.5 w-full bg-[#ECE6DA] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-[#028090] to-[#03A9B3] transition-all" style={{ width: `${(step/3)*100}%` }} />
        </div>

        <div className="gt-card p-6 md:p-8 gt-fade-up">
          <div className="flex items-center gap-2 text-[#028090] text-sm mb-2"><Heart className="h-4 w-4" /> {t('start.gentle', lang)}</div>

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">{t('start.s1.title', lang)}</h1>
              <p className="text-sm text-slate-500 mb-4">{t('start.s1.sub', lang)}</p>

              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={extracting}
                className="w-full mb-4 rounded-2xl border-2 border-dashed border-[#028090]/40 bg-[#F0F8F8] p-4 hover:bg-[#E1EFEF] flex items-center gap-3 transition-colors">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {extracting ? <Loader2 className="h-5 w-5 animate-spin text-[#028090]" /> : <Upload className="h-5 w-5 text-[#028090]" />}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#014f5a]">{extracting ? t('start.upload_reading', lang) : t('start.upload_cta', lang)}</div>
                  <div className="text-xs text-slate-600">{t('start.upload_sub', lang)}</div>
                </div>
              </button>

              {extracted && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('start.doc_read', lang)}</div>
                    <div className="text-xs">{t('start.doc_read_sub', lang)}</div>
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium mb-1">{t('start.deceased_name', lang)}</label>
              <input className="gt-input mb-4" placeholder={lang === 'hi' ? 'e.g. रामेश कुमार' : 'e.g. Ramesh Kumar'} value={form.deceasedName} onChange={e => update('deceasedName', e.target.value)} />
              <label className="block text-sm font-medium mb-1">{t('start.dod', lang)}</label>
              <input type="date" className="gt-input mb-4" value={form.dateOfDeath} onChange={e => update('dateOfDeath', e.target.value)} />

              <label className="block text-sm font-medium mb-1">{t('start.aadhaar', lang)}</label>
              <input className={`gt-input mb-1 ${form.aadhaar && !aadhaarOk ? 'border-red-300' : ''}`}
                inputMode="numeric" maxLength={14} placeholder="1234 5678 9012"
                value={form.aadhaar} onChange={e => update('aadhaar', e.target.value.replace(/[^0-9 ]/g, ''))} />
              <p className={`text-xs mb-4 ${form.aadhaar && !aadhaarOk ? 'text-red-600' : 'text-slate-500'}`}>
                {form.aadhaar && !aadhaarOk ? t('start.invalid_aadhaar', lang) : t('start.aadhaar_sub', lang)}
              </p>

              <label className="block text-sm font-medium mb-1">{t('start.pincode', lang)}</label>
              <input className={`gt-input mb-1 ${form.pincode && !pinOk ? 'border-red-300' : ''}`}
                inputMode="numeric" maxLength={6} placeholder="411014"
                value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/[^0-9]/g, ''))} />
              <p className={`text-xs mb-4 ${form.pincode && !pinOk ? 'text-red-600' : 'text-slate-500'}`}>
                {form.pincode && !pinOk ? t('start.invalid_pincode', lang) : t('start.pincode_sub', lang)}
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('start.state', lang)}</label>
                  <select className="gt-input" value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">{lang === 'hi' ? 'चुनें…' : 'Select…'}</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('start.city', lang)}</label>
                  <input className="gt-input" placeholder="Pune" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">{t('start.s2.title', lang)}</h1>
              <p className="text-sm text-slate-500 mb-4">{t('start.s2.sub', lang)}</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('start.your_name', lang)}</label>
                  <input className="gt-input" value={form.claimantName} onChange={e => update('claimantName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('start.phone', lang)}</label>
                  <input className="gt-input" placeholder="+91 …" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
              <label className="block text-sm font-medium mb-1 mt-3">{t('start.email', lang)}</label>
              <input className="gt-input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              <label className="block text-sm font-medium mb-1 mt-3">{t('start.address', lang)}</label>
              <textarea rows={2} className="gt-input" placeholder={t('start.address_ph', lang)} value={form.address} onChange={e => update('address', e.target.value)} />
              <label className="block text-sm font-medium mb-1 mt-3">{t('start.relationship', lang)}</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONS_KEYS.map(r => (
                  <button key={r.en} type="button" onClick={() => update('relationship', r.en)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${form.relationship === r.en ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white border-[#ECE6DA] text-slate-700 hover:border-[#028090]'}`}>
                    {lang === 'hi' ? r.hi : r.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">{t('start.s3.title', lang)}</h1>
              <p className="text-sm text-slate-500 mb-4">{t('start.s3.sub', lang)}</p>

              <label className="block text-sm font-medium mb-1">{t('start.uan', lang)}</label>
              <div className="relative mb-2">
                <input className="gt-input pr-10" placeholder="100200300400" value={form.assets.uan}
                  onChange={e => { updateAsset('uan', e.target.value); checkUAN(e.target.value); }} />
                {epfChecking && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#028090]" />}
                {!epfChecking && epfResult?.found && <CheckCircle2 className="absolute right-3 top-3.5 h-4 w-4 text-emerald-600" />}
              </div>
              {epfResult?.found && (
                <div className="mb-4 rounded-xl border border-[#028090]/30 bg-[#E1EFEF] p-3">
                  <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold flex items-center gap-1"><Sparkles className="h-3 w-3" /> {t('start.magic_detection', lang)}</div>
                  <div className="font-semibold text-[#014f5a]">{t('start.epf_detected', lang)}</div>
                  <div className="text-xs text-slate-700">{t('start.employer', lang)}: <b>{epfResult.employer}</b> · {t('start.member_id', lang)} {epfResult.member_id}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'banks', label: t('start.banks', lang) },
                  { k: 'policies', label: t('start.policies', lang) },
                  { k: 'property', label: t('start.property', lang) },
                  { k: 'mutualFunds', label: t('start.mutualFunds', lang) }
                ].map(o => (
                  <label key={o.k} className={`px-4 py-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${form.assets[o.k] ? 'bg-[#E1EFEF] border-[#028090]' : 'bg-white border-[#ECE6DA]'}`}>
                    <input type="checkbox" checked={!!form.assets[o.k]} onChange={e => updateAsset(o.k, e.target.checked)} />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
              <label className={`mt-3 px-4 py-3 rounded-xl border flex items-center gap-2 cursor-pointer ${form.assets.notSure ? 'bg-[#E1EFEF] border-[#028090]' : 'bg-white border-[#ECE6DA]'}`}>
                <input type="checkbox" checked={!!form.assets.notSure} onChange={e => updateAsset('notSure', e.target.checked)} />
                <span className="text-sm">{t('start.not_sure', lang)}</span>
              </label>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="text-sm text-slate-500 inline-flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" /> {t('common.back', lang)}
            </button>
            {step < 3 ? (
              <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
                className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2 disabled:opacity-50">
                {t('common.continue', lang)} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('common.build_plan', lang)}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
