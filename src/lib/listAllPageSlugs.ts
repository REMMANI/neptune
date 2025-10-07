// src/lib/listAllPageSlugs.ts
export type Locale = "en" | "fr" | "es" | "ar";

/**
 * Use [] to represent the locale homepage: /[locale]
 * Each inner array is a slug segment list, e.g. ["blog","how-to-buy"] => /[locale]/blog/how-to-buy
 */
const STATIC_SLUGS: Record<Locale, string[][]> = {
  en: [
    [],                 // /en
    ["about"],
    ["inventory"],
    ["blog"],
    ["blog", "how-to-buy"],
    ["contact"],
  ],
  fr: [
    [],                 // /fr
    ["a-propos"],
    ["inventaire"],
    ["blog"],
  ],
  es: [
    [],                 // /es
    ["acerca-de"],
  ],
  ar: [
    [],                 // /ar
    ["حول"],
  ],
};

export async function listAllPageSlugs(locale: Locale): Promise<string[][]> {
  return STATIC_SLUGS[locale] ?? [];
}
