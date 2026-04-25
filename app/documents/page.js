'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import { FileText, Download, Eye } from 'lucide-react';

const DOCS = [
  { key: 'epf_form_20', title: 'EPF Form 20 — Withdrawal Claim', agency: 'EPFO', desc: 'To claim the lump-sum Provident Fund balance of the deceased member.' },
  { key: 'epf_form_10d', title: 'EPF Form 10D — Monthly Pension', agency: 'EPFO', desc: 'For family / widow pension under EPS-1995.' },
  { key: 'bank_transfer_letter', title: 'Bank Account Transfer Letter', agency: 'Bank', desc: 'Intimation and claim letter for the home branch.' },
  { key: 'insurance_claim_letter', title: 'Insurance Death-Claim Letter', agency: 'Insurer', desc: 'Nominee intimation letter under IRDAI norms.' },
  { key: 'succession_cert_application', title: 'Succession Certificate Application', agency: 'Civil Court', desc: 'Section 372, Indian Succession Act, 1925.' },
  { key: 'death_cert_application', title: 'Death Certificate Application', agency: 'Municipal Registrar', desc: 'Request 10 original copies — every claim needs one.' },
  { key: 'property_mutation', title: 'Property Mutation Request', agency: 'Revenue Dept.', desc: 'Transfer ownership record in heir\'s name.' }
];

export default function DocumentsPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
  }, [router]);

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-5xl mx-auto px-5 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Your document library</h1>
        <p className="text-slate-600">Every form below is pre-filled using your details. Preview, then print and sign.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {DOCS.map(d => (
            <div key={d.key} className="gt-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#E6F3F4] flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#028090]" />
                </div>
                <div>
                  <div className="font-semibold leading-tight">{d.title}</div>
                  <div className="text-xs text-slate-500">{d.agency}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">{d.desc}</div>
              <div className="mt-3 flex gap-2">
                {sessionId && (
                  <>
                    <a href={`/api/document/${d.key}/${sessionId}`} target="_blank"
                      className="text-xs px-3 py-1.5 rounded-full bg-[#E6F3F4] text-[#014f5a] inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Preview
                    </a>
                    <a href={`/api/document/${d.key}/${sessionId}`} download
                      className="text-xs gt-btn-primary px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                      <Download className="h-3 w-3" /> Download PDF
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <AIChatWidget sessionId={sessionId} />
    </main>
  );
}
