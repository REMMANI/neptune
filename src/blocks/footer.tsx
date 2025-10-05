'use client';

import Image from "next/image";

export type FooterProps = {
    brand?: { name?: string; logo?: string, alt?: string };
    year?: number;
};

export function Footer({ brand, year = new Date().getFullYear() }: FooterProps) {
    return (
        <footer className="py-10 border-t mt-16">
            <div className="container mx-auto px-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-3">
                    {brand?.logo && (
                        <Image
                        src={brand.logo}
                        alt={brand.alt ?? brand.name ?? "logo"}
                        width={96}            // pick the real intrinsic width
                        height={24}           // pick the real intrinsic height
                        priority              // logos are usually above the fold
                        sizes="96px"
                        className="h-6 w-auto"
                        />
                    )}
                    <span>{brand?.name ?? 'Dealership'}</span>
                </div>
                <div>© {year} All rights reserved.</div>
            </div>
        </footer>
    );
}
