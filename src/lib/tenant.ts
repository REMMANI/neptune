import { headers } from 'next/headers';
import { findSiteConfigByDomain, findSiteConfigBySlug, findSiteConfigByExternalId } from './db';
import { dealerService } from './dealer-service';

export type TenantInfo = {
  externalDealerId: string; // Changed from dealerId to externalDealerId
  dealerId: string; // Added site config ID
  locale: string;
  themeKey: string;
};

// Fallback mapping for development/testing - maps to external dealer IDs
const FALLBACK_DOMAIN_MAP: Record<string, string> = {
  'premium.localhost:3001': 'PMV-2024-001',
  'sunshine.localhost:3001': 'SFD-2024-002',
  'mountain.localhost:3001': 'MVC-2024-003',
  'localhost:3000': 'PMV-2024-001',
  'localhost:3001': 'PMV-2024-001',
  '127.0.0.1:3000': 'PMV-2024-001',
  '127.0.0.1:3001': 'PMV-2024-001',
};

const DEFAULT_EXTERNAL_DEALER_ID = 'PMV-2024-001';

async function getDealerByDomain(host: string): Promise<{ externalDealerId: string; dealerId: string; themeKey: string } | null> {
  try {
    // Check database for domain or subdomain match
    const siteConfig = await findSiteConfigByDomain(host);

    if (siteConfig) {
      // Validate that external dealer exists
      const dealer = await dealerService.getDealerById(siteConfig.externalDealerId);
      if (dealer && dealer.isActive) {
        return {
          externalDealerId: siteConfig.externalDealerId,
          dealerId: siteConfig.id,
          themeKey: 'base'
        };
      }
    }

    // Fallback to hardcoded mapping for development
    const fallbackExternalId = FALLBACK_DOMAIN_MAP[host];
    if (fallbackExternalId) {
      // Validate external dealer exists
      const dealer = await dealerService.getDealerById(fallbackExternalId);
      if (dealer && dealer.isActive) {
        // Try to find existing site config for this external dealer
        let siteConfig = await findSiteConfigByExternalId(fallbackExternalId);

        if (!siteConfig) {
          // Create a temporary site config ID for fallback
          // In production, you'd want to create this in the database
          console.warn(`No site config found for external dealer ${fallbackExternalId}, using fallback`);
        }

        return {
          externalDealerId: fallbackExternalId,
          dealerId: siteConfig?.id || 'fallback-site-config',
          themeKey: 'base'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error resolving dealer by domain:', error);
    return null;
  }
}

async function getSiteConfigById(dealerId: string): Promise<{ externalDealerId: string; dealerId: string; themeKey: string } | null> {
  try {
    const siteConfig = await findSiteConfigById(dealerId);

    if (siteConfig) {
      // Validate that external dealer exists
      const dealer = await dealerService.getDealerById(siteConfig.externalDealerId);
      if (dealer && dealer.isActive) {
        return {
          externalDealerId: siteConfig.externalDealerId,
          dealerId: siteConfig.id,
          themeKey: 'base'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error resolving dealer by site config ID:', error);
    return null;
  }
}

export async function resolveTenant(
  host?: string,
  pathname?: string,
  dealerHeader?: string
): Promise<TenantInfo> {
  let externalDealerId: string | null = null;
  let dealerId: string | null = null;
  let themeKey = 'base';
  let locale = 'en'; // Default locale

  // 1. Check X-Dealer-ID header first (highest priority) - assume this is site config ID
  if (dealerHeader) {
    const result = await getSiteConfigById(dealerHeader);
    if (result) {
      externalDealerId = result.externalDealerId;
      dealerId = result.dealerId;
      themeKey = result.themeKey;
    }
  }
  // 2. Check domain/subdomain mapping from database
  else if (host) {
    const result = await getDealerByDomain(host);
    if (result) {
      externalDealerId = result.externalDealerId;
      dealerId = result.dealerId;
      themeKey = result.themeKey;
    }
  }

  // 3. If no dealer found, use default
  if (!externalDealerId) {
    // Try to get default external dealer directly
    const dealer = await dealerService.getDealerById(DEFAULT_EXTERNAL_DEALER_ID);
    if (dealer && dealer.isActive) {
      externalDealerId = DEFAULT_EXTERNAL_DEALER_ID;

      // Try to find site config for default dealer
      const siteConfig = await findSiteConfigByExternalId(DEFAULT_EXTERNAL_DEALER_ID);
      dealerId = siteConfig?.id || 'fallback-site-config';
    }
  }

  // 4. Extract locale from pathname (format: /en/... or /fr/...)
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

  // 5. Final fallback if still no dealer found
  if (!externalDealerId) {
    throw new Error('No dealer could be resolved for this request');
  }

  return {
    externalDealerId,
    dealerId: dealerId!,
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

export function getTenantCacheKey(externalDealerId: string, locale: string): string {
  return `tenant:${externalDealerId}:${locale}`;
}

export function getDealerOverridePath(externalDealerId: string): string {
  return `dealers/${externalDealerId}`;
}