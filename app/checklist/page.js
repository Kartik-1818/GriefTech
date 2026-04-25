'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import { Check, Download, Sparkles, Loader2, MapPin, Clock, FileCheck2 } from 'lucide-react';

function PriorityChip({ p }) {
  const map = { high: 'bg-red-50 text-red-700', medium: 'bg-amber-50 text-amber-700', low: 'bg-slate-100 text-slate-600' };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${map[p] || map.low}`}>{p}</span>;
}
function CategoryChip({ c }) {
  const map = { legal: 'bg-blue-50 text-blue-700', financial: 'bg-emerald-50 text-emerald-700', personal: 'bg-purple-50 text-purple-700' };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${map[c] || 'bg-slate-100 text-slate-600'}`}>{c}</span>;
}

export default function ChecklistPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [open, setOpen] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [view, setView] = useState('cards'); // cards | timeline
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    fetch(`/api/checklist/${sid}`).then(r => r.json()).then(d => setChecklist(d.checklist || []));
  }, [router]);

  async function toggle(id) {
    setToggling(id);
    const r = await fetch('/api/checklist/toggle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, taskId: id })
    }).then(r => r.json());
    setChecklist(r.checklist || []);
    setToggling(null);
  }

  const today = new Date();
  function status(t) {
    if (t.status === 'done') return 'done';
    if (new Date(t.dueDate) < today) return 'overdue';
    return 'upcoming';
  }
  const filtered = useMemo(() => {
    if (filter === 'all') return checklist;
    return checklist.filter(t => filter === t.category || filter === status(t));
  }, [checklist, filter]);

  const done = checklist.filter(t => t.status === 'done').length;

  function badge(t) {
    const s = status(t);
    if (s === 'done') return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Done</span>;
    const days = Math.ceil((new Date(t.dueDate) - today) / 86400000);
    if (s === 'overdue') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Overdue {-days}d</span>;
    if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In {days}d</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">In {days}d</span>;
  }

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Your 90-day plan</h1>
            <p className="text-slate-600">One step at a time. Take breaks — this is a marathon, not a sprint.</p>
          </div>
          <div className="text-sm text-slate-600">{done} / {checklist.length} completed</div>
        </div>
        <div className="mt-3 h-1.5 bg-[#EDE7DC] rounded-full overflow-hidden">
          <div className="h-full bg-[#028090]" style={{ width: `${checklist.length ? (done/checklist.length)*100 : 0}%` }} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['all','overdue','upcoming','done','legal','financial','personal'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border ${filter === f ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white text-slate-600 border-[#E1EFEF] hover:border-[#028090]'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex bg-white rounded-full border border-[#E1EFEF] p-1 text-xs">
            <button onClick={() => setView('cards')} className={`px-3 py-1 rounded-full ${view === 'cards' ? 'bg-[#028090] text-white' : 'text-slate-600'}`}>Cards</button>
            <button onClick={() => setView('timeline')} className={`px-3 py-1 rounded-full ${view === 'timeline' ? 'bg-[#028090] text-white' : 'text-slate-600'}`}>Timeline</button>
          </div>
        </div>

        {view === 'cards' && (
          <div className="mt-6 space-y-3">
            {filtered.map(t => (
              <div key={t.id} className="gt-card p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggle(t.id)} disabled={toggling === t.id}
                    className={`h-6 w-6 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${t.status === 'done' ? 'bg-[#028090] border-[#028090] text-white' : 'border-[#028090]'}`}>
                    {toggling === t.id ? <Loader2 className="h-3 w-3 animate-spin text-[#028090]" /> : (t.status === 'done' && <Check className="h-4 w-4" />)}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`font-medium ${t.status === 'done' ? 'line-through text-slate-400' : ''}`}>{t.title}</div>
                      {badge(t)}
                      <PriorityChip p={t.priority} />
                      <CategoryChip c={t.category} />
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{t.description}</div>
                    <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs text-slate-600">
                      {t.where_to_go && <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[#028090]" /> {t.where_to_go}</div>}
                      {t.estimated_time && <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#028090]" /> {t.estimated_time}</div>}
                      {t.required_docs?.length > 0 && <div className="flex items-center gap-1"><FileCheck2 className="h-3 w-3 text-[#028090]" /> {t.required_docs.length} docs needed</div>}
                    </div>
                    {t.required_docs?.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">Bring:</span> {t.required_docs.join(' · ')}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {t.form && (
                        <a href={`/api/document/${t.form}/${sessionId}`} target="_blank"
                          className="text-xs gt-btn-primary px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                          <Download className="h-3 w-3" /> Pre-filled form
                        </a>
                      )}
                      <button onClick={() => setOpen(open === t.id ? null : t.id)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a] inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Ask AI
                      </button>
                    </div>
                  </div>
                </div>
                {open === t.id && (
                  <InlineAsk sessionId={sessionId} seed={`Please explain step in plain language: ${t.title}. Keep it simple and action-oriented.`} />
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'timeline' && (
          <div className="mt-6 relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#E1EFEF]" />
            {filtered.map(t => {
              const s = status(t);
              const dot = s === 'done' ? 'bg-emerald-500' : s === 'overdue' ? 'bg-red-500' : 'bg-amber-500';
              return (
                <div key={t.id} className="relative mb-4">
                  <div className={`absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-[#FAF8F5] ${dot}`} />
                  <div className="gt-card p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xs text-slate-500">Day {t.deadline_days}</div>
                      <div className="font-medium">{t.title}</div>
                      {badge(t)}
                      <PriorityChip p={t.priority} />
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{t.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <AIChatWidget sessionId={sessionId} />
    </main>
  );
}

function InlineAsk({ sessionId, seed }) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: seed }) }).then(r => r.json());
        setReply(r.reply || r.error || '');
      } finally { setLoading(false); }
    })();
  }, [sessionId, seed]);
  return (
    <div className="mt-3 ml-9 gt-chat-bubble-a px-3 py-2 text-sm whitespace-pre-wrap">
      {loading ? 'Thinking with care…' : reply}
    </div>
  );
}
