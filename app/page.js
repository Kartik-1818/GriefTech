'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, ChevronRight, ScanSearch, Upload, Bell, ShieldCheck, HeartHandshake, FileText } from 'lucide-react';
import AIChatWidget from '@/components/AIChatWidget';
import LanguageToggle from '@/components/LanguageToggle';
import { t, getLang } from '@/lib/i18n';

export default function Home() {
  const [lang, setLang] = useState('en');
  useEffect(() => { setLang(getLang()); }, []);

  return (
    <main className="min-h-screen gt-gradient">
      <nav className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#028090] to-[#03A9B3] flex items-center justify-center text-white font-bold shadow-md">G</div>
          <span className="font-semibold text-lg tracking-tight">{t('common.app_name', lang)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <LanguageToggle />
          <Link href="/start" className="gt-btn-primary rounded-full px-4 py-2 font-medium">{t('landing.cta_start', lang)}</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-5 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="gt-fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#014f5a] bg-white border border-[#E1EFEF] px-3 py-1 rounded-full mb-4 shadow-sm">
            <Sparkles className="h-3 w-3" /> {t('landing.tagline', lang)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[#1F2D31]">
            {t('landing.title_1', lang)}<br /><span className="text-[#028090]">{t('landing.title_2', lang)}</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">{t('landing.subtitle', lang)}</p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link href="/start" className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2">
              {t('landing.cta_start', lang)} <ChevronRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="text-slate-600 hover:text-slate-900 text-sm">{t('landing.learn_more', lang)}</a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5"><Upload className="h-4 w-4 text-[#028090]" /> {t('landing.feature_upload', lang)}</div>
            <div className="flex items-center gap-1.5"><ScanSearch className="h-4 w-4 text-[#028090]" /> {t('landing.feature_magic', lang)}</div>
            <div className="flex items-center gap-1.5"><Bell className="h-4 w-4 text-[#028090]" /> {t('landing.feature_panic', lang)}</div>
          </div>
        </div>
        <div className="relative">
          <div className="gt-card overflow-hidden">
            <img src="https://images.pexels.com/photos/33321461/pexels-photo-33321461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="" className="w-full h-[360px] object-cover" />
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ScanSearch className="h-4 w-4 text-[#028090]" /> {t('landing.scanner_caption', lang)}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 gt-card px-5 py-4 hidden md:block">
            <div className="text-base font-semibold text-[#028090]">{t('landing.epf_card_t', lang)}</div>
            <div className="text-xs text-slate-500">{t('landing.epf_card_s', lang)}</div>
          </div>
        </div>
      </section>

      <section id="why" className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">{t('landing.stat_8m', lang)}</div>
            <div className="text-sm text-slate-600 mt-1">{t('landing.stat_8m_sub', lang)}</div>
          </div>
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">{t('landing.stat_23', lang)}</div>
            <div className="text-sm text-slate-600 mt-1">{t('landing.stat_23_sub', lang)}</div>
          </div>
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">{t('landing.stat_lost', lang)}</div>
            <div className="text-sm text-slate-600 mt-1">{t('landing.stat_lost_sub', lang)}</div>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-5 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">{t('landing.how_title', lang)}</h2>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Upload, k_t: 'landing.how_upload', k_s: 'landing.how_upload_sub' },
            { icon: ScanSearch, k_t: 'landing.how_magic', k_s: 'landing.how_magic_sub' },
            { icon: Bell, k_t: 'landing.how_panic', k_s: 'landing.how_panic_sub' },
            { icon: Sparkles, k_t: 'landing.how_ai', k_s: 'landing.how_ai_sub' }
          ].map((f, i) => (
            <div key={i} className="gt-card p-5">
              <div className="h-10 w-10 rounded-xl bg-[#E1EFEF] flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-[#028090]" />
              </div>
              <div className="font-semibold">{t(f.k_t, lang)}</div>
              <div className="text-sm text-slate-600 mt-1">{t(f.k_s, lang)}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <Link href="/start" className="gt-btn-primary rounded-full px-8 py-4 text-lg font-medium inline-flex items-center gap-2">
            {t('landing.begin', lang)} <ChevronRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-slate-500 max-w-md text-center">{t('landing.sources', lang)}</p>
        </div>
      </section>

      <AIChatWidget greeting={t('landing.greeting', lang)} />
    </main>
  );
}
