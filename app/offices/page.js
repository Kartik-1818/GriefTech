'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import { MapPin, Phone, Clock, ExternalLink, Loader2, Building, Briefcase, Landmark, Scale, IdCard, Receipt, Car, Wallet, Shield, FileSignature } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';

const ICONS = {
  EPFO: Briefcase, MUNICIPAL: Building, SUB_REGISTRAR: FileSignature,
  TEHSILDAR: Landmark, CIVIL_COURT: Scale, AADHAAR_KENDRA: IdCard,
  IT_OFFICE: Receipt, RTO: Car, BANK: Wallet, INSURER: Shield
};

export default function OfficesPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [data, setData] = useState(null);
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');

  useEffect(() => { setLang(getLang()); }, []);
  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    (async () => {
      const s = await fetch(`/api/session/${sid}`).then(r => r.json());
      const p = s?.profile?.pincode || '';
      setPin(p); setPinInput(p);
      if (p) {
        const o = await fetch(`/api/offices?pin=${p}`).then(r => r.json());
        setData(o);
      }
      setLoading(false);
    })();
  }, [router]);

  async function search() {
    if (!/^\d{6}$/.test(pinInput)) return;
    setLoading(true);
    const o = await fetch(`/api/offices?pin=${pinInput}`).then(r => r.json());
    setData(o); setPin(pinInput); setLoading(false);
  }

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('offices.title', lang)}</h1>
            <p className="text-slate-600">{t('offices.sub', lang)} {pin}{data?.city ? ` · ${data.city}, ${data.state}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <input className="gt-input w-32" inputMode="numeric" maxLength={6} placeholder="PIN"
              value={pinInput} onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} />
            <button onClick={search} className="gt-btn-primary rounded-full px-4 py-2 text-sm">{t('offices.change_pin', lang)}</button>
          </div>
        </div>

        {loading && (
          <div className="mt-6 gt-card p-6 flex items-center gap-3 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        )}

        {!loading && data?.generic && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            We don\'t have a curated list for this PIN yet — we\'ve generated direct Google Maps searches for every office category instead. They will land you at the closest match.
          </div>
        )}

        {!loading && data?.groups?.map(g => {
          const Icon = ICONS[g.category] || Building;
          return (
            <div key={g.category} className="mt-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-xl bg-[#E1EFEF] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#028090]" />
                </div>
                <div>
                  <div className="font-semibold">{g.label}</div>
                  <div className="text-xs text-slate-500">{g.why}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {g.offices.map((o, i) => (
                  <div key={i} className="gt-card p-4">
                    <div className="font-semibold leading-snug">{o.name}</div>
                    <div className="text-sm text-slate-600 mt-1 flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {o.address}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {o.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {o.phone}</span>}
                      {o.hours && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {o.hours}</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={o.mapsLink} target="_blank" className="text-xs gt-btn-primary px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {t('offices.directions', lang)}
                      </a>
                      {o.phone && <a href={`tel:${o.phone}`} className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a]">{t('offices.call', lang)}</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!loading && data && data.groups?.length === 0 && (
          <div className="mt-6 gt-card p-6 text-slate-500">{t('offices.empty', lang)}</div>
        )}
      </section>
      <AIChatWidget sessionId={sessionId} language={lang} />
    </main>
  );
}
