'use client';
import Image from 'next/image';


export default function Nav({ menu, locale, logo }: { menu: Array<{ label: Record<string, string>; href: string }>; locale: string; logo?: { url: string; alt?: string } }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center gap-6">
        {logo?.url && (
            <Image
            src={logo.url}
            alt={logo.alt ?? "logo"}
            width={96}            
            height={24}           
            priority              
            sizes="96px"
            className="h-6 w-auto"
            />
        )}
        <ul className="flex items-center gap-4 text-sm">
          <li>test 100133</li>
        </ul>
      </nav>
    </header>
  );
}