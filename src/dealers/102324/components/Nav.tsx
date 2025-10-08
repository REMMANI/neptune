'use client';

import Image from "next/image";

type Item = { label: Record<string,string>; href: string };
export type NavProps = {
  menu: Item[];
  locale?: string;
  logo?: { url?: string; alt?: string };
  variant?: 'default' | 'premium' | 'banner';
};

export default function Dealer102324Nav({ menu, locale, logo, variant }: NavProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
        {logo?.url && (
          <Image
            src={logo.url}
            alt={logo.alt ?? "Logo"}
            width={120}             // fallback intrinsic size
            height={32}             // tweak to your brand ratio
            className="h-6 w-auto"  // keeps your header height
            priority                 // logos are above the fold
          />
        )}
        <span className="font-semibold text-red-600">Prime Drive</span>
        </div>
        <nav className="flex gap-6 text-sm">
          {menu.map((m, i) => (
            <a key={i} href={`/${locale ?? 'en'}${m.href}`} className="hover:text-red-600">
              {m.label[locale ?? 'en'] ?? m.label.en}
            </a>
          ))}
        </nav>
      </div>
      {variant === 'banner' && (
        <div className="w-full bg-red-600 px-4 py-1 text-center text-white text-xs">
          VIP banner for 102324
        </div>
      )}
    </header>
  );
}
