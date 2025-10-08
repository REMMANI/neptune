import { headers } from 'next/headers';
import { findDealerByDomain, findDealerBySlug, findDealerById } from './db';
import { getFromCache, setCache } from './redis';

export type TenantInfo = {
  dealerId: string;
  locale: string;
  themeKey: string;
};

// Fallback mapping for development/testing
const FALLBACK_DOMAIN_MAP: Record<string, string> = {
  'premium.example.com': 'premium-motors',
  'classic.example.com': 'classic-auto',
  'localhost:3000': 'premium-motors',
  '127.0.0.1:3000': 'premium-motors',
};

const DEFAULT_DEALER = { dealerId: 'premium-motors', themeKey: 'base' };

async function getDealerByDomain(host: string): Promise<{ dealerId: string; themeKey: string } | null> {
  const cacheKey = `dealer:domain:${host}`;

  // Try cache first
  const cached = await getFromCache<{ dealerId: string; themeKey: string }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Check database for domain or subdomain match
    const dealer = await findDealerByDomain(host);

    if (dealer) {
      const result = { dealerId: dealer.id, themeKey: dealer.themeKey };
      await setCache(cacheKey, result, 600); // Cache for 10 minutes
      return result;
    }

    // Fallback to hardcoded mapping for development
    const fallbackSlug = FALLBACK_DOMAIN_MAP[host];
    if (fallbackSlug) {
      const fallbackDealer = await findDealerBySlug(fallbackSlug);

      if (fallbackDealer) {
        const result = { dealerId: fallbackDealer.id, themeKey: fallbackDealer.themeKey };
        await setCache(cacheKey, result, 600);
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error('Error resolving dealer by domain:', error);
    return null;
  }
}

async function getDealerById(dealerId: string): Promise<{ dealerId: string; themeKey: string } | null> {
  const cacheKey = `dealer:id:${dealerId}`;

  const cached = await getFromCache<{ dealerId: string; themeKey: string }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const dealer = await findDealerById(dealerId);

    if (dealer) {
      const result = { dealerId: dealer.id, themeKey: dealer.themeKey };
      await setCache(cacheKey, result, 600);
      return result;
    }

    return null;
  } catch (error) {
    console.error('Error resolving dealer by ID:', error);
    return null;
  }
}

export async function resolveTenant(
  host?: string,
  pathname?: string,
  dealerHeader?: string
): Promise<TenantInfo> {
  let dealerId = DEFAULT_DEALER.dealerId;
  let themeKey = DEFAULT_DEALER.themeKey;
  let locale = 'en'; // Default locale

  // 1. Check X-Dealer-ID header first (highest priority)
  if (dealerHeader) {
    const dealer = await getDealerById(dealerHeader);
    if (dealer) {
      dealerId = dealer.dealerId;
      themeKey = dealer.themeKey;
    }
  }
  // 2. Check domain/subdomain mapping from database
  else if (host) {
    const dealer = await getDealerByDomain(host);
    if (dealer) {
      dealerId = dealer.dealerId;
      themeKey = dealer.themeKey;
    }
  }

  // 3. Extract locale from pathname (format: /en/... or /fr/...)
  if (pathname) {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (localeMatch) {
      const extractedLocale = localeMatch[1];
      const supportedLocales = ['en', 'fr', 'es', 'ar'];
      if (supportedLocales.includes(extractedLocale)) {
        locale = extractedLocale;
      }
    }
  }

  return {
    dealerId,
    locale,
    themeKey,
  };
}

export async function getCurrentTenant(): Promise<TenantInfo> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const pathname = headersList.get('x-pathname') || '';
  const dealerHeader = headersList.get('x-dealer-id') || '';

  return resolveTenant(host, pathname, dealerHeader);
}

export function getTenantCacheKey(dealerId: string, locale: string): string {
  return `tenant:${dealerId}:${locale}`;
}

export function getDealerOverridePath(dealerId: string): string {
  return `dealers/${dealerId}`;
}