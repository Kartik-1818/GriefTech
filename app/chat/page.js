'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import { Send, Sparkles } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';

export default function ChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const scrollRef = useRef(null);

  useEffect(() => { setLang(getLang()); }, []);
  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    setMessages([{ role: 'assistant', content: t('chat.welcome_full', getLang()) }]);
  }, [router]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput(''); setMessages(m => [...m, { role: 'user', content }]);
    setLoading(true);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, message: content, language: lang }) }).then(r => r.json());
    setMessages(m => [...m, { role: 'assistant', content: r.reply || r.error || '' }]);
    setLoading(false);
  }

  const quick = [t('chat.q_bank', lang), t('chat.q_ins', lang), t('chat.q_form20', lang), t('chat.q_today', lang)];

  return (
    <main className="min-h-screen gt-gradient flex flex-col">
      <DashboardNav />
      <section className="max-w-3xl mx-auto w-full px-5 py-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[#028090] font-semibold mb-2"><Sparkles className="h-4 w-4" /> {t('chat.title', lang)}</div>
        <div ref={scrollRef} className="flex-1 gt-card p-4 overflow-y-auto gt-scroll space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'ml-auto gt-chat-bubble-u' : 'gt-chat-bubble-a'}`}>{m.content}</div>
          ))}
          {loading && <div className="gt-chat-bubble-a max-w-[60%] px-3 py-2 text-sm"><span className="animate-pulse">{t('chat.thinking', lang)}</span></div>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map(q => <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a] hover:bg-[#cfe8eb]">{q}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={t('chat.placeholder', lang)} className="gt-input" />
          <button disabled={loading} className="gt-btn-primary rounded-xl px-4 py-3"><Send className="h-4 w-4" /></button>
        </form>
      </section>
    </main>
  );
}
