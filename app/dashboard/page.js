'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import PanicButton from '@/components/PanicButton';
import { ScanSearch, ListChecks, FileText, Sparkles, ArrowRight, Loader2, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [assets, setAssets] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [epf, setEpf] = useState(null);

  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    (async () => {
      const s = await fetch(`/api/session/${sid}`).then(r => r.json());
      if (s?.profile) { setProfile(s.profile); setChecklist(s.checklist || []); }
      setScanning(true);
      await new Promise(r => setTimeout(r, 900));
      const a = await fetch(`/api/assets/scan/${sid}`).then(r => r.json());
      setAssets(a.assets || []);
      setScanning(false);
      // EPF magic insight
      if (s?.profile?.assets?.uan) {
        const e = await fetch('/api/epfo-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uan: s.profile.assets.uan }) }).then(r => r.json()).catch(() => null);
        setEpf(e);
      }
    })();
  }, [router]);

  const done = checklist.filter(t => t.status === 'done').length;
  const greeting = `I'm so sorry for your loss. Losing ${profile?.deceasedName || 'someone you love'} is not something anyone can truly prepare for. Take a deep breath — I'll walk you through the next steps, one at a time. Shall we start with the most urgent one?`;

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-6xl mx-auto px-5 py-6">
        <div className="gt-fade-up">
          <h1 className="text-2xl md:text-3xl font-semibold">Hello{profile?.claimantName ? `, ${profile.claimantName.split(' ')[0]}` : ''}.</h1>
          <p className="text-slate-600">Here is your personalised plan for honouring {profile?.deceasedName || 'your loved one'} — at your pace.</p>
        </div>

        {/* Panic button — the centerpiece */}
        <div className="mt-6">
          <PanicButton sessionId={sessionId} />
        </div>

        {/* EPF magic insight */}
        {epf?.found && (
          <div className="mt-5 rounded-2xl border border-[#028090]/30 bg-white p-5 gt-fade-up">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#E1EFEF] flex items-center justify-center shrink-0">
                <Briefcase className="h-6 w-6 text-[#028090]" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold">Magic insight • EPFO</div>
                <div className="font-semibold text-lg">EPF account detected</div>
                <div className="text-sm text-slate-600 mt-1">Employer on record: <span className="font-medium text-slate-800">{epf.employer}</span></div>
                <div className="text-xs text-slate-500 mt-1">Member ID {epf.member_id} • last contribution {epf.last_contribution} • EPS member: {epf.eps_member ? 'Yes' : 'No'} • Nominee: {epf.nominee_on_record}</div>
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

        {/* Three cards */}
        <div className="mt-6 grid md:grid-cols-3 gap-5">
          <div className="gt-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4 text-[#028090]" /> 90-day Checklist</div>
              <Link href="/checklist" className="text-xs text-[#028090]">Open →</Link>
            </div>
            <div className="mt-3 text-3xl font-bold">{done} <span className="text-base text-slate-500 font-normal">of {checklist.length}</span></div>
            <div className="text-xs text-slate-500">tasks completed</div>
            <div className="mt-3 h-1.5 bg-[#EDE7DC] rounded-full overflow-hidden">
              <div className="h-full bg-[#028090]" style={{ width: `${checklist.length ? (done/checklist.length)*100 : 0}%` }} />
            </div>
            <div className="mt-4 text-sm">
              <div className="font-medium">Next up</div>
              <div className="text-slate-600">{checklist.find(t => t.status !== 'done')?.title || 'All caught up 🌿'}</div>
            </div>
          </div>

          <div className="gt-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><ScanSearch className="h-4 w-4 text-[#028090]" /> Discovered assets</div>
              <Link href="/assets" className="text-xs text-[#028090]">Open →</Link>
            </div>
            <div className="mt-3 text-3xl font-bold">{scanning ? <Loader2 className="h-7 w-7 animate-spin text-[#028090]"/> : (assets?.length || 0)}</div>
            <div className="text-xs text-slate-500">asset types found</div>
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
              <div className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-[#028090]" /> Quick documents</div>
              <Link href="/documents" className="text-xs text-[#028090]">Open →</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { k: 'epf_form_20', l: 'EPF Form 20' },
                { k: 'bank_transfer_letter', l: 'Bank letter' },
                { k: 'insurance_claim_letter', l: 'Insurance claim' },
                { k: 'succession_cert_application', l: 'Succession' }
              ].map(d => (
                <a key={d.k} href={`/api/document/${d.k}/${sessionId}`} target="_blank"
                  className="px-3 py-2 rounded-xl bg-[#E1EFEF] text-[#014f5a] text-xs font-medium hover:bg-[#cfe8eb] text-center">
                  {d.l}
                </a>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500">Pre-filled with your details. Always verify before signing.</div>
          </div>
        </div>

        <div className="mt-6 gt-card p-5">
          <div className="flex items-center gap-2 text-[#028090] font-semibold"><Sparkles className="h-4 w-4" /> Your AI guide is listening</div>
          <p className="text-sm text-slate-600 mt-1">Ask things like “what do I do about his bank account?” or “insurance ka claim kaise karun?” — in the floating chat.</p>
        </div>
      </section>

      <AIChatWidget sessionId={sessionId} openByDefault={!!profile} greeting={greeting} language={profile?.language || 'en'} />
    </main>
  );
}
