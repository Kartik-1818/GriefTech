'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Bell, Loader2, MapPin, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { t, getLang } from '@/lib/i18n';

export default function PanicButton({ sessionId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [lang, setLang] = useState('en');
  useEffect(() => { setLang(getLang()); }, []);

  async function trigger() {
    setOpen(true); setLoading(true); setData(null);
    try { const r = await fetch(`/api/panic/${sessionId}`).then(r => r.json()); setData(r); }
    finally { setLoading(false); }
  }

  return (
    <>
      <button onClick={trigger}
        className="w-full md:w-auto group rounded-2xl px-6 py-5 bg-gradient-to-br from-[#028090] via-[#03A0AC] to-[#03B4BE] text-white text-left shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Bell className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider opacity-80">{t('dashboard.right_now', lang)}</div>
            <div className="text-xl font-bold">{t('dashboard.panic_title', lang)}</div>
            <div className="text-xs opacity-80">{t('dashboard.panic_sub', lang)}</div>
          </div>
          <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="gt-card max-w-xl w-full max-h-[90vh] overflow-y-auto gt-scroll p-0 gt-fade-up">
            <div className="p-5 bg-gradient-to-r from-[#028090] to-[#03A9B3] text-white flex items-center justify-between rounded-t-[22px]">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">{t('panic.right_now', lang)}</div>
                  <div className="text-lg font-semibold">{t('panic.your_3_steps', lang)}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {loading && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> {t('panic.looking', lang)}</div>}
              {data && (
                <>
                  {(data.actions || []).map((a, i) => (
                    <div key={i} className="rounded-xl border border-[#E1EFEF] p-4 bg-[#FAFCFC]">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#028090] text-white text-sm font-bold flex items-center justify-center shrink-0">{i+1}</div>
                        <div className="flex-1">
                          <div className="font-semibold leading-snug">{a.title}</div>
                          <div className="text-sm text-slate-600 mt-1">{a.plain}</div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            {a.estimated_time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.estimated_time}</span>}
                            <span className={`px-2 py-0.5 rounded-full ${a.priority === 'high' ? 'bg-red-50 text-red-700' : a.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{a.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.warning && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">{t('panic.watch', lang)}</div>
                        <div className="text-sm text-amber-900 mt-0.5">{data.warning}</div>
                      </div>
                    </div>
                  )}
                  <Link href="/checklist" onClick={() => setOpen(false)}
                    className="block text-center gt-btn-primary rounded-full px-5 py-3 font-medium">
                    {t('panic.open_full', lang)}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
