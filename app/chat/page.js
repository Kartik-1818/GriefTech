'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import { Send, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const sid = localStorage.getItem('gt_session');
    if (!sid) { router.push('/start'); return; }
    setSessionId(sid);
    setMessages([{ role: 'assistant', content: "I'm so sorry for your loss. I'm here with you. Would you like to start with the most urgent step, or ask anything that's on your mind?" }]);
  }, [router]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput(''); setMessages(m => [...m, { role: 'user', content }]);
    setLoading(true);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, message: content }) }).then(r => r.json());
    setMessages(m => [...m, { role: 'assistant', content: r.reply || r.error || 'Something went wrong.' }]);
    setLoading(false);
  }

  const quick = ['What do I do about his bank account?', 'How do I claim the insurance?', 'Explain EPF Form 20 simply', 'मुझे आज क्या करना चाहिए?'];

  return (
    <main className="min-h-screen gt-gradient flex flex-col">
      <DashboardNav />
      <section className="max-w-3xl mx-auto w-full px-5 py-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[#028090] font-semibold mb-2"><Sparkles className="h-4 w-4" /> GriefTech Guide</div>
        <div ref={scrollRef} className="flex-1 gt-card p-4 overflow-y-auto gt-scroll space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'ml-auto gt-chat-bubble-u' : 'gt-chat-bubble-a'}`}>{m.content}</div>
          ))}
          {loading && <div className="gt-chat-bubble-a max-w-[60%] px-3 py-2 text-sm"><span className="animate-pulse">Thinking with care…</span></div>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map(q => <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full bg-[#E6F3F4] text-[#014f5a] hover:bg-[#cfe8eb]">{q}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your question…" className="flex-1 px-4 py-3 rounded-xl border border-[#EDE7DC] bg-white gt-ring" />
          <button disabled={loading} className="gt-btn-primary rounded-xl px-4 py-3"><Send className="h-4 w-4" /></button>
        </form>
      </section>
    </main>
  );
}
