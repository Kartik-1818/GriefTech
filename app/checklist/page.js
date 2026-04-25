'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AIChatWidget from '@/components/AIChatWidget';
import { Check, Download, Sparkles, Loader2, Clock, FileCheck2, Building } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';

function PriorityChip({ p }) {
  const map = { high: 'bg-red-50 text-red-700', medium: 'bg-amber-50 text-amber-700', low: 'bg-slate-100 text-slate-600' };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${map[p] || map.low}`}>{p}</span>;
}
function CategoryChip({ c, lang }) {
  const map = { legal: 'bg-blue-50 text-blue-700', financial: 'bg-emerald-50 text-emerald-700', personal: 'bg-purple-50 text-purple-700' };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${map[c] || 'bg-slate-100 text-slate-600'}`}>{t('checklist.f.' + c, lang)}</span>;
}

export default function ChecklistPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [open, setOpen] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [view, setView] = useState('cards');
  const [filter, setFilter] = useState('all');
  const [lang, setLang] = useState('en');

  useEffect(() => { setLang(getLang()); }, []);
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

  function badge(task) {
    const s = status(task);
    if (s === 'done') return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{t('checklist.f.done', lang)}</span>;
    const days = Math.ceil((new Date(task.dueDate) - today) / 86400000);
    if (s === 'overdue') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{t('checklist.f.overdue', lang)} {-days}d</span>;
    if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{t('checklist.in', lang)} {days}d</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t('checklist.in', lang)} {days}d</span>;
  }

  const filters = ['all','overdue','upcoming','done','legal','financial','personal'];

  return (
    <main className="min-h-screen gt-gradient">
      <DashboardNav />
      <section className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('checklist.title', lang)}</h1>
            <p className="text-slate-600">{t('checklist.sub', lang)}</p>
          </div>
          <div className="text-sm text-slate-600">{done} / {checklist.length} {t('checklist.completed', lang)}</div>
        </div>
        <div className="mt-3 h-1.5 bg-[#ECE6DA] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#028090] to-[#03A9B3]" style={{ width: `${checklist.length ? (done/checklist.length)*100 : 0}%` }} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white text-slate-600 border-[#ECE6DA] hover:border-[#028090]'}`}>
                {t('checklist.f.' + f, lang)}
              </button>
            ))}
          </div>
          <div className="flex bg-white rounded-full border border-[#ECE6DA] p-1 text-xs">
            <button onClick={() => setView('cards')} className={`px-3 py-1 rounded-full ${view === 'cards' ? 'bg-[#028090] text-white' : 'text-slate-600'}`}>{t('checklist.view.cards', lang)}</button>
            <button onClick={() => setView('timeline')} className={`px-3 py-1 rounded-full ${view === 'timeline' ? 'bg-[#028090] text-white' : 'text-slate-600'}`}>{t('checklist.view.timeline', lang)}</button>
          </div>
        </div>

        {view === 'cards' && (
          <div className="mt-6 space-y-3">
            {filtered.map(task => (
              <div key={task.id} className="gt-card p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggle(task.id)} disabled={toggling === task.id}
                    className={`h-6 w-6 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-[#028090] border-[#028090] text-white' : 'border-[#028090]'}`}>
                    {toggling === task.id ? <Loader2 className="h-3 w-3 animate-spin text-[#028090]" /> : (task.status === 'done' && <Check className="h-4 w-4" />)}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`font-medium ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>{t(task.titleKey, lang)}</div>
                      {badge(task)}
                      <PriorityChip p={task.priority} />
                      <CategoryChip c={task.category} lang={lang} />
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{t(task.descKey, lang)}</div>
                    <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs text-slate-600">
                      {task.where_to_go_cat && <div className="flex items-center gap-1"><Building className="h-3 w-3 text-[#028090]" /> {task.where_to_go_cat.replace('_', ' ').toLowerCase()}</div>}
                      {task.estimated_time && <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#028090]" /> {task.estimated_time}</div>}
                      {task.required_docs?.length > 0 && <div className="flex items-center gap-1"><FileCheck2 className="h-3 w-3 text-[#028090]" /> {task.required_docs.length} docs</div>}
                    </div>
                    {task.required_docs?.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{t('checklist.bring', lang)}:</span> {task.required_docs.join(' · ')}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {task.form && (
                        <a href={`/api/document/${task.form}/${sessionId}`} target="_blank"
                          className="text-xs gt-btn-primary px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                          <Download className="h-3 w-3" /> {t('checklist.prefilled', lang)}
                        </a>
                      )}
                      <button onClick={() => setOpen(open === task.id ? null : task.id)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a] inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> {t('checklist.ask_ai', lang)}
                      </button>
                    </div>
                  </div>
                </div>
                {open === task.id && (
                  <InlineAsk sessionId={sessionId} lang={lang} seed={`Please explain this step in ${lang === 'hi' ? 'Hindi' : 'English'} simply: ${t(task.titleKey, lang)}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'timeline' && (
          <div className="mt-6 relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#E1EFEF]" />
            {filtered.map(task => {
              const s = status(task);
              const dot = s === 'done' ? 'bg-emerald-500' : s === 'overdue' ? 'bg-red-500' : 'bg-amber-500';
              return (
                <div key={task.id} className="relative mb-4">
                  <div className={`absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-[#FAF7F2] ${dot}`} />
                  <div className="gt-card p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xs text-slate-500">{t('checklist.day', lang)} {task.deadline_days}</div>
                      <div className="font-medium">{t(task.titleKey, lang)}</div>
                      {badge(task)}
                      <PriorityChip p={task.priority} />
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{t(task.descKey, lang)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <AIChatWidget sessionId={sessionId} language={lang} />
    </main>
  );
}

function InlineAsk({ sessionId, seed, lang }) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: seed, language: lang }) }).then(r => r.json());
        setReply(r.reply || r.error || '');
      } finally { setLoading(false); }
    })();
  }, [sessionId, seed, lang]);
  return (
    <div className="mt-3 ml-9 gt-chat-bubble-a px-3 py-2 text-sm whitespace-pre-wrap">
      {loading ? t('checklist.thinking', lang) : reply}
    </div>
  );
}
