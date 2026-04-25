'use client';
import { useEffect, useRef, useState } from 'react';
import { MessageCircleHeart, Send, X, Sparkles } from 'lucide-react';

export default function AIChatWidget({ sessionId, openByDefault = false, greeting, language = 'en' }) {
  const [open, setOpen] = useState(openByDefault);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (openByDefault && messages.length === 0 && greeting) {
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [openByDefault, greeting, messages.length]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [messages, open, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content }]);
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: content, language })
      });
      const data = await r.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || data.error || 'Sorry, something went wrong.' }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry — I could not reach the assistant.' }]);
    } finally { setLoading(false); }
  }

  const quick = [
    'What do I do about his bank account?',
    'How do I claim the insurance?',
    'What is EPF Form 20?',
    'मुझे सबसे पहले क्या करना चाहिए?'
  ];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 gt-btn-primary rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 gt-fade-up">
          <MessageCircleHeart className="h-5 w-5" />
          <span className="font-medium">Talk to your guide</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-[min(420px,95vw)] h-[min(620px,85vh)] gt-card flex flex-col overflow-hidden gt-fade-up">
          <div className="px-4 py-3 bg-[#028090] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">GriefTech Guide</div>
                <div className="text-[11px] opacity-80">Empathetic • Private • Always here</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto gt-scroll p-4 space-y-3 bg-[#FAF8F5]">
            {messages.length === 0 && (
              <div className="text-sm text-slate-500">Ask me anything — about the paperwork, the steps, or just how to get through the next hour.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'ml-auto gt-chat-bubble-u' : 'gt-chat-bubble-a'}`}>{m.content}</div>
            ))}
            {loading && (
              <div className="gt-chat-bubble-a max-w-[60%] px-3 py-2 text-sm">
                <span className="inline-block animate-pulse">Thinking with care…</span>
              </div>
            )}
          </div>
          {messages.length < 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2 bg-[#FAF8F5] border-t border-[#EDE7DC]">
              {quick.map(q => (
                <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full bg-[#E6F3F4] text-[#014f5a] hover:bg-[#cfe8eb]">{q}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 p-3 border-t border-[#EDE7DC] bg-white">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…"
              className="flex-1 px-3 py-2 rounded-xl border border-[#EDE7DC] gt-ring" />
            <button type="submit" disabled={loading} className="gt-btn-primary rounded-xl px-3 py-2"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
