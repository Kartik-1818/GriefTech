'use client';
import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { setLang as set, getLang } from '@/lib/i18n';

export default function LanguageToggle() {
  const [lang, setL] = useState('en');
  useEffect(() => { setL(getLang()); }, []);
  return (
    <div className="inline-flex items-center bg-white border border-[#ECE6DA] rounded-full p-0.5 text-xs">
      <Globe className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
      <button onClick={() => lang !== 'en' && set('en')}
        className={`px-2.5 py-1 rounded-full ${lang === 'en' ? 'bg-[#028090] text-white' : 'text-slate-600 hover:text-slate-900'}`}>EN</button>
      <button onClick={() => lang !== 'hi' && set('hi')}
        className={`px-2.5 py-1 rounded-full ${lang === 'hi' ? 'bg-[#028090] text-white' : 'text-slate-600 hover:text-slate-900'}`}>हिन्दी</button>
    </div>
  );
}
