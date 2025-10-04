// Minimal i18n helper. You can swap for a CMS later.
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'ar'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];


export const messages: Record<Locale, Record<string, string>> = {
    en: {
        'nav.home': 'Home',
        'nav.pricing': 'Pricing',
        'cta.start': 'Start free',
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.pricing': 'Tarifs',
        'cta.start': 'Commencer',
    },
    es: {
        'nav.home': 'Inicio',
        'nav.pricing': 'Precios',
        'cta.start': 'Empezar',
    },
    ar: {
        'nav.home': 'الرئيسية',
        'nav.pricing': 'الأسعار',
        'cta.start': 'ابدأ مجانًا',
    }
};


export function t(locale: Locale, key: string, fallback?: string) {
    return messages[locale]?.[key] ?? fallback ?? key;
}