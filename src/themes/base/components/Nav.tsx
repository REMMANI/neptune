'use client';
import Link from 'next/link';
import { tr } from '@/lib/i18n';
import Image from 'next/image';


export default function Nav({ menu, locale, logo }: { menu: Array<{ label: Record<string, string>; href: string }>; locale: string; logo?: { url: string; alt?: string } }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center gap-6">
        {logo?.url && (
            <Image
            src={logo.url}
            alt={logo.alt ?? "logo"}
            width={96}            // pick the real intrinsic width
            height={24}           // pick the real intrinsic height
            priority              // logos are usually above the fold
            sizes="96px"
            className="h-6 w-auto"
            />
        )}
        <ul className="flex items-center gap-4 text-sm">
          {menu.map((m, i) => (
            <li key={i}><Link href={`/${locale}${m.href}`}>{tr(m.label, locale, m.href)}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}