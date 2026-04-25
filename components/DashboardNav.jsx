'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, ScanSearch, FileText, MessageCircleHeart, MapPin } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { t, getLang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function DashboardNav() {
  const path = usePathname();
  const [lang, setLang] = useState('en');
  useEffect(() => { setLang(getLang()); }, []);
  const links = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard', lang) },
    { href: '/checklist', icon: ListChecks, label: t('nav.checklist', lang) },
    { href: '/assets', icon: ScanSearch, label: t('nav.assets', lang) },
    { href: '/documents', icon: FileText, label: t('nav.documents', lang) },
    { href: '/offices', icon: MapPin, label: t('nav.offices', lang) },
    { href: '/chat', icon: MessageCircleHeart, label: t('nav.chat', lang) }
  ];
  return (
    <nav className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#028090] to-[#03A9B3] flex items-center justify-center text-white font-bold shadow-md">G</div>
        <span className="font-semibold tracking-tight">{t('common.app_name', lang)}</span>
      </Link>
      <div className="flex items-center gap-1 flex-wrap">
        {links.map(l => {
          const active = path === l.href;
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}
              className={`px-3 py-2 rounded-full text-sm inline-flex items-center gap-1.5 ${active ? 'bg-[#028090] text-white shadow-md' : 'text-slate-600 hover:bg-[#E1EFEF]'}`}>
              <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
        <LanguageToggle />
      </div>
    </nav>
  );
}
