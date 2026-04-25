'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import { ScanSearch, Download, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AssetsPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [assets, setAssets] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [epf, setEpf] = useState(null);

  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    (async () => {
      const profile = await fetch(`/api/session/${sid}`).then(r => r.json());
      await new Promise(r => setTimeout(r, 800));
      const a = await fetch(`/api/assets/scan/${sid}`).then(r => r.json());
      setAssets(a.assets || []); setScanning(false);
      if (profile?.profile?.assets?.uan) {
        const e = await fetch('/api/epfo-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uan: profile.profile.assets.uan }) }).then(r => r.json()).catch(() => null);
        setEpf(e);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-5xl mx-auto px-5 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Hidden asset scan</h1>
        <p className="text-slate-600">We searched official databases for asset *types* that may belong to your family.</p>

        <div className="mt-5 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#028090,#03A9B3)' }}>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <ScanSearch className="h-3 w-3" />
            {scanning ? 'Scanning EPFO · IEPF · IRDAI · RBI DEA…' : 'Scan complete — 4 sources checked'}
          </div>
          <div className="mt-1 text-2xl md:text-3xl font-semibold">
            {scanning ? 'Looking carefully…' : `${assets?.length || 0} asset type${(assets?.length || 0) === 1 ? '' : 's'} discovered`}
          </div>
          <div className="text-xs opacity-80 mt-1">Each one comes with what it means and what to do next.</div>
        </div>

        {epf?.found && (
          <div className="mt-5 gt-card p-5 border-l-4 border-[#028090]">
            <div className="text-xs uppercase tracking-wider text-[#028090] font-semibold">Magic insight · EPFO match</div>
            <div className="font-semibold text-lg flex items-center gap-2 mt-1"><CheckCircle2 className="h-5 w-5 text-[#028090]" /> EPF account detected</div>
            <div className="text-sm text-slate-700 mt-1">Employer on record: <span className="font-semibold">{epf.employer}</span></div>
            <div className="text-xs text-slate-500 mt-1">Member ID {epf.member_id} · EPS member: {epf.eps_member ? 'Yes' : 'No'} · Nominee: {epf.nominee_on_record}</div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {scanning && (
            <div className="gt-card p-6 flex items-center gap-3 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Talking to EPFO…</div>
          )}
          {assets?.map(a => (
            <div key={a.id} className="gt-card p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#E1EFEF] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-[#028090]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">{a.source}</div>
                  <div className="font-semibold text-lg">{a.headline}</div>
                  <div className="text-sm text-slate-700 mt-1">{a.detail}</div>
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wider text-slate-500">What it means</div>
                      <div className="text-slate-700 mt-0.5">{a.meaning}</div>
                    </div>
                    <div className="rounded-xl bg-[#E1EFEF] p-3">
                      <div className="text-xs uppercase tracking-wider text-[#014f5a]">What to do next</div>
                      <div className="text-slate-800 mt-0.5">{a.next_step}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.formKey && (
                      <a href={`/api/document/${a.formKey}/${sessionId}`} target="_blank"
                        className="text-xs gt-btn-primary px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                        <Download className="h-3 w-3" /> Pre-filled form
                      </a>
                    )}
                    <a href="/checklist" className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a] inline-flex items-center gap-1">
                      Open in checklist <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <AIChatWidget sessionId={sessionId} />
    </main>
  );
}
