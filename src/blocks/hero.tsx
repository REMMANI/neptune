'use client';
import { t } from '@/lib/i18n';


interface HeroProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
    locale?: 'en' | 'fr' | 'es' | 'ar';
}

export function Hero({ title, subtitle, ctaText, locale = 'en' }: HeroProps) {
    return (
        <section className="relative isolate overflow-hidden py-24">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 h-[320px] w-[720px] -translate-x-1/2 rounded-[100%] bg-brand-50/40 blur-3xl" />
            </div>
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="mt-4 text-lg text-slate-600">{subtitle}</p>}
                <div className="mt-8 flex justify-center">
                    <a href="#" className="rounded-full bg-brand-600 px-6 py-3 text-white shadow hover:opacity-90">
                        {ctaText || t(locale, 'cta.start')}
                    </a>
                </div>
            </div>
        </section>
    );
}