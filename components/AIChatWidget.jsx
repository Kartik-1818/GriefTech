'use client';
import { useEffect, useRef, useState } from 'react';
import { MessageCircleHeart, Send, X, Sparkles } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';

export default function AIChatWidget({ sessionId, openByDefault = false, greeting, language = null }) {
  const [open, setOpen] = useState(openByDefault);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const scrollRef = useRef(null);

  useEffect(() => { setLang(language || getLang()); }, [language]);
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
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: content, language: lang }) });
      const data = await r.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || data.error || 'Sorry.' }]);
    } catch { setMessages(m => [...m, { role: 'assistant', content: 'Sorry — I could not reach the assistant.' }]); }
    finally { setLoading(false); }
  }

  const quick = [ t('chat.q_bank', lang), t('chat.q_ins', lang), t('chat.q_form20', lang), t('chat.q_today', lang) ];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 gt-btn-primary rounded-full px-5 py-3 flex items-center gap-2 gt-fade-up">
          <MessageCircleHeart className="h-5 w-5" />
          <span className="font-medium">{t('nav.talk_guide', lang)}</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-[min(420px,95vw)] h-[min(620px,85vh)] gt-card flex flex-col overflow-hidden gt-fade-up">
          <div className="px-4 py-3 bg-gradient-to-r from-[#028090] to-[#03A9B3] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">{t('chat.title', lang)}</div>
                <div className="text-[11px] opacity-80">{t('chat.subtitle', lang)}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto gt-scroll p-4 space-y-3 bg-[#FAF7F2]">
            {messages.length === 0 && <div className="text-sm text-slate-500">{t('chat.empty', lang)}</div>}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'ml-auto gt-chat-bubble-u' : 'gt-chat-bubble-a'}`}>{m.content}</div>
            ))}
            {loading && <div className="gt-chat-bubble-a max-w-[60%] px-3 py-2 text-sm"><span className="animate-pulse">{t('chat.thinking', lang)}</span></div>}
          </div>
          {messages.length < 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2 bg-[#FAF7F2] border-t border-[#ECE6DA]">
              {quick.map(q => (
                <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full bg-[#E1EFEF] text-[#014f5a] hover:bg-[#cfe8eb]">{q}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 p-3 border-t border-[#ECE6DA] bg-white">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.placeholder', lang)} className="gt-input" />
            <button type="submit" disabled={loading} className="gt-btn-primary rounded-xl px-3 py-2"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
