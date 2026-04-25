'use client';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, FileText, Sparkles, ChevronRight, ScanSearch, Upload, Bell } from 'lucide-react';
import AIChatWidget from '@/components/AIChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen gt-gradient">
      <nav className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#028090] flex items-center justify-center text-white font-bold">G</div>
          <span className="font-semibold text-lg">GriefTech</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a href="#why" className="text-slate-600 hover:text-slate-900">Why this matters</a>
          <a href="#how" className="text-slate-600 hover:text-slate-900 hidden sm:inline">How it works</a>
          <Link href="/start" className="gt-btn-primary rounded-full px-4 py-2 font-medium">Get Started</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-5 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="gt-fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#014f5a] bg-[#E1EFEF] px-3 py-1 rounded-full mb-4">
            <Sparkles className="h-3 w-3" /> Calm guidance for Indian families after a loss
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your AI guide through one of<br />life's hardest moments.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl">
            What should you do next, right now? GriefTech turns 20+ confusing legal & financial steps into one
            calm, guided plan — with auto-filled forms and an empathetic assistant beside you.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/start" className="gt-btn-primary rounded-full px-6 py-3 font-medium inline-flex items-center gap-2">
              Start — it takes 60 seconds <ChevronRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="text-slate-600 hover:text-slate-900 text-sm">Learn more</a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5"><Upload className="h-4 w-4 text-[#028090]" /> Upload → auto-fill</div>
            <div className="flex items-center gap-1.5"><ScanSearch className="h-4 w-4 text-[#028090]" /> EPF magic detection</div>
            <div className="flex items-center gap-1.5"><Bell className="h-4 w-4 text-[#028090]" /> Panic button</div>
          </div>
        </div>
        <div className="relative">
          <div className="gt-card overflow-hidden">
            <img src="https://images.pexels.com/photos/33321461/pexels-photo-33321461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Family hands joined in support" className="w-full h-[360px] object-cover" />
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ScanSearch className="h-4 w-4 text-[#028090]" />
                Detects EPF accounts, insurance policies, deposits, dividends and property
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 gt-card px-5 py-4 hidden md:block">
            <div className="text-base font-semibold text-[#028090]">EPF account detected</div>
            <div className="text-xs text-slate-500">Tata Consultancy Services Ltd. • last contribution Mar 2025</div>
          </div>
        </div>
      </section>

      <section id="why" className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">8 million</div>
            <div className="text-sm text-slate-600 mt-1">Indians lose a loved one every year</div>
          </div>
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">23+</div>
            <div className="text-sm text-slate-600 mt-1">legal & financial tasks each grieving family has to navigate</div>
          </div>
          <div className="gt-card p-6">
            <div className="text-3xl font-bold text-[#028090]">Quietly lost</div>
            <div className="text-sm text-slate-600 mt-1">millions of EPF, IEPF, insurance and bank deposits go unclaimed</div>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-5 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">How GriefTech helps</h2>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Upload, title: 'Upload, auto-fill', body: 'Drop a death certificate or Aadhaar — we read it and pre-fill every form.' },
            { icon: ScanSearch, title: 'Magic detection', body: 'Enter the UAN. We surface the EPF, employer, pension and what to claim.' },
            { icon: Bell, title: 'Panic button', body: '“What should I do now?” — 3 actions, one warning, in plain language.' },
            { icon: Sparkles, title: 'AI by your side', body: 'Calm Hindi/English guide that always gives the next step, not jargon.' }
          ].map((f, i) => (
            <div key={i} className="gt-card p-5">
              <div className="h-10 w-10 rounded-full bg-[#E1EFEF] flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-[#028090]" />
              </div>
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-slate-600 mt-1">{f.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <Link href="/start" className="gt-btn-primary rounded-full px-8 py-4 text-lg font-medium inline-flex items-center gap-2">
            Begin with care <ChevronRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-slate-500 max-w-md text-center">Sources: EPFO (epfindia.gov.in), IEPF (iepf.gov.in), IRDAI, RBI DEA Fund.</p>
        </div>
      </section>

      <AIChatWidget greeting="I'm here whenever you need me. When you're ready, click Get Started and I'll walk beside you." />
    </main>
  );
}
