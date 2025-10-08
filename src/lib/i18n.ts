export const locales = ['en', 'fr', 'es', 'ar'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove existing locale prefix if present
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}(\/|$)/, '/');

  // Add new locale prefix
  return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

export function removeLocaleFromPath(path: string): string {
  return path.replace(/^\/[a-z]{2}(\/|$)/, '/');
}

export function extractLocaleFromPath(path: string): { locale: Locale; pathWithoutLocale: string } {
  const match = path.match(/^\/([a-z]{2})(\/.*)?$/);

  if (match && isValidLocale(match[1])) {
    return {
      locale: match[1],
      pathWithoutLocale: match[2] || '/',
    };
  }

  return {
    locale: defaultLocale,
    pathWithoutLocale: path,
  };
}

// Simple translation function - in a real app you'd use a proper i18n library
export function t(key: string, locale: Locale = 'en'): string {
  const translations: Record<string, Record<Locale, string>> = {
    'nav.home': {
      en: 'Home',
      fr: 'Accueil',
      es: 'Inicio',
      ar: 'الرئيسية',
    },
    'nav.inventory': {
      en: 'Inventory',
      fr: 'Inventaire',
      es: 'Inventario',
      ar: 'المخزون',
    },
    'nav.about': {
      en: 'About',
      fr: 'À propos',
      es: 'Acerca de',
      ar: 'حول',
    },
    'nav.contact': {
      en: 'Contact',
      fr: 'Contact',
      es: 'Contacto',
      ar: 'اتصل',
    },
    'common.loading': {
      en: 'Loading...',
      fr: 'Chargement...',
      es: 'Cargando...',
      ar: 'جاري التحميل...',
    },
    'common.error': {
      en: 'Something went wrong',
      fr: 'Quelque chose a mal tourné',
      es: 'Algo salió mal',
      ar: 'حدث خطأ ما',
    },
  };

  return translations[key]?.[locale] || key;
}

export function tr(labels: Record<string, string> | undefined, locale: string, fallback?: string) {
    if (!labels) return fallback ?? '';
    return labels[locale] ?? labels['en'] ?? Object.values(labels)[0] ?? fallback ?? '';
}