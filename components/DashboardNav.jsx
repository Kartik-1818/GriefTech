'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, ScanSearch, FileText, MessageCircleHeart } from 'lucide-react';

const LINKS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/checklist', icon: ListChecks, label: 'Checklist' },
  { href: '/assets', icon: ScanSearch, label: 'Assets' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/chat', icon: MessageCircleHeart, label: 'AI Guide' }
];

export default function DashboardNav() {
  const path = usePathname();
  return (
    <nav className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[#028090] flex items-center justify-center text-white font-bold">G</div>
        <span className="font-semibold">GriefTech</span>
      </Link>
      <div className="flex items-center gap-1 flex-wrap">
        {LINKS.map(l => {
          const active = path === l.href;
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}
              className={`px-3 py-2 rounded-full text-sm inline-flex items-center gap-1.5 ${active ? 'bg-[#028090] text-white' : 'text-slate-600 hover:bg-[#E6F3F4]'}`}>
              <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
