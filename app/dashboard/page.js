'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import PanicButton from '@/components/PanicButton';
import { ScanSearch, ListChecks, FileText, Sparkles, ArrowRight, Loader2, Briefcase, MapPin } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';

export default function Dashboard() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [assets, setAssets] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [epf, setEpf] = useState(null);
  const [offices, setOffices] = useState(null);
  const [lang, setLang] = useState('en');

  useEffect(() => { setLang(getLang()); }, []);
  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    (async () => {
      const s = await fetch(`/api/session/${sid}`).then(r => r.json());
      if (s?.profile) { setProfile(s.profile); setChecklist(s.checklist || []); }
      setScanning(true);
      await new Promise(r => setTimeout(r, 700));
      const a = await fetch(`/api/assets/scan/${sid}`).then(r => r.json());
      setAssets(a.assets || []);
      setScanning(false);
      if (s?.profile?.assets?.uan) {
        const e = await fetch('/api/epfo-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uan: s.profile.assets.uan }) }).then(r => r.json()).catch(() => null);
        setEpf(e);
      }
      if (s?.profile?.pincode) {
        const o = await fetch(`/api/offices?pin=${s.profile.pincode}`).then(r => r.json()).catch(() => null);
        setOffices(o);
      }
    })();
  }, [router]);

  const done = checklist.filter(t => t.status === 'done').length;
  const next = checklist.find(t => t.status !== 'done');
  const greeting = `${t('dashboard.greeting_a', lang)} ${profile?.deceasedName || ''} ${t('dashboard.greeting_b', lang)}`;

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-6xl mx-auto px-5 py-6">
        <div className="gt-fade-up">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('dashboard.hello', lang)}{profile?.claimantName ? `, ${profile.claimantName.split(' ')[0]}` : ''}.</h1>
          <p className="text-slate-600">{t('dashboard.your_plan', lang)} {profile?.deceasedName || ''}.</p>
        </div>

        <div className="mt-6"><PanicButton sessionId={sessionId} /></div>

        {epf?.found && (
          <div className="mt-5 rounded-2xl border border-[#028090]/30 bg-white p-5 gt-fade-up shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E1EFEF] to-[#C9E4DE] flex items-center justify-center shrink-0">
                <Briefcase className="h-6 w-6 text-[#028090]" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold">{t('dashboard.magic_insight', lang)}</div>
                <div className="font-semibold text-lg">{t('dashboard.epf_detected', lang)}</div>
                <div className="text-sm text-slate-600 mt-1">{t('dashboard.employer_on_record', lang)}: <span className="font-medium text-slate-800">{epf.employer}</span></div>
                <div className="text-xs text-slate-500 mt-1">{t('dashboard.member_id', lang)} {epf.member_id} • {t('dashboard.last_contribution', lang)} {epf.last_contribution} • {t('dashboard.eps_member', lang)}: {epf.eps_member ? '✓' : '✗'} • {t('dashboard.nominee', lang)}: {epf.nominee_on_record}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(epf.actions || []).map(a => (
                    <a key={a.formKey} href={`/api/document/${a.formKey}/${sessionId}`} target="_blank"
                      className="text-xs gt-btn-primary rounded-full px-3 py-1.5">{a.title}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-3 gap-5">
          <div className="gt-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4 text-[#028090]" /> {t('dashboard.checklist_card', lang)}</div>
              <Link href="/checklist" className="text-xs text-[#028090]">→</Link>
            </div>
            <div className="mt-3 text-3xl font-bold">{done} <span className="text-base text-slate-500 font-normal">{t('dashboard.of', lang)} {checklist.length}</span></div>
            <div className="text-xs text-slate-500">{t('dashboard.tasks_completed', lang)}</div>
            <div className="mt-3 h-1.5 bg-[#ECE6DA] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#028090] to-[#03A9B3]" style={{ width: `${checklist.length ? (done/checklist.length)*100 : 0}%` }} />
            </div>
            <div className="mt-4 text-sm">
              <div className="font-medium">{t('dashboard.next_up', lang)}</div>
              <div className="text-slate-600">{next ? t(next.titleKey, lang) : t('dashboard.all_caught_up', lang)}</div>
            </div>
          </div>

          <div className="gt-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><ScanSearch className="h-4 w-4 text-[#028090]" /> {t('dashboard.discovered', lang)}</div>
              <Link href="/assets" className="text-xs text-[#028090]">→</Link>
            </div>
            <div className="mt-3 text-3xl font-bold">{scanning ? <Loader2 className="h-7 w-7 animate-spin text-[#028090]"/> : (assets?.length || 0)}</div>
            <div className="text-xs text-slate-500">{t('dashboard.asset_types_found', lang)}</div>
            <div className="mt-3 space-y-1 text-sm">
              {(assets || []).slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#028090]" />
                  <span className="text-slate-700">{a.headline}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="gt-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-[#028090]" /> {t('dashboard.quick_docs', lang)}</div>
              <Link href="/documents" className="text-xs text-[#028090]">→</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { k: 'epf_form_20', l: 'EPF Form 20' },
                { k: 'bank_transfer_letter', l: 'Bank letter' },
                { k: 'insurance_claim_letter', l: 'Insurance' },
                { k: 'succession_cert_application', l: 'Succession' }
              ].map(d => (
                <a key={d.k} href={`/api/document/${d.k}/${sessionId}`} target="_blank"
                  className="px-3 py-2 rounded-xl bg-[#E1EFEF] text-[#014f5a] text-xs font-medium hover:bg-[#cfe8eb] text-center transition-colors">
                  {d.l}
                </a>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500">{t('dashboard.quick_docs_sub', lang)}</div>
          </div>
        </div>

        {/* Offices preview card */}
        {offices && (
          <div className="mt-6 gt-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-[#028090]" /> {t('dashboard.offices_card', lang)}</div>
              <Link href="/offices" className="text-xs text-[#028090]">→</Link>
            </div>
            <div className="text-xs text-slate-500">{t('dashboard.offices_sub', lang)} — PIN {offices.pin}{offices.city ? ` · ${offices.city}` : ''}{offices.state ? `, ${offices.state}` : ''}</div>
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              {(offices.groups || []).slice(0, 6).map(g => (
                <div key={g.category} className="rounded-xl bg-[#FAFCFC] border border-[#E1EFEF] p-3">
                  <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold">{g.label}</div>
                  <div className="text-sm font-medium mt-0.5 line-clamp-2">{g.offices[0]?.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{g.offices[0]?.address}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 gt-card p-5">
          <div className="flex items-center gap-2 text-[#028090] font-semibold"><Sparkles className="h-4 w-4" /> {t('dashboard.ai_listening', lang)}</div>
          <p className="text-sm text-slate-600 mt-1">{t('dashboard.ai_listening_sub', lang)}</p>
        </div>
      </section>

      <AIChatWidget sessionId={sessionId} openByDefault={!!profile} greeting={greeting} language={lang} />
    </main>
  );
}
