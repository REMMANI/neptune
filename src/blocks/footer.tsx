'use client';

import Image from 'next/image';

type FooterProps = {
    brand?: {
        logo?: string;
        name?: string;
    };
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
                            alt="logo"
                            height={24}
                            width={24}
                            className="h-6 w-auto"
                            priority
                        />
                    )}
                    <span>{brand?.name ?? 'Brand'}</span>
                </div>
                <div>© {year} All rights reserved.</div>
            </div>
        </footer>
    );
}