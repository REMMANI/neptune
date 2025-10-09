import 'server-only';
import { DealerConfig, DealerConfigSchema } from '@/types/customization';
import { dealerService } from './dealer-service';
import { themeService } from './theme-service';
// import { getFromCache, setCache } from './redis';

// Base theme configurations
const BASE_THEMES: Record<string, Partial<DealerConfig>> = {
  base: {
    theme: {
      key: 'base',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
      },
      spacing: {
        containerWidth: '1280px',
        sectionPadding: '4rem',
      },
    },
    tokens: {
      borderRadius: '8px',
      shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
  },
  t1: {
    theme: {
      key: 't1',
      colors: {
        primary: '#dc2626',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
      },
      spacing: {
        containerWidth: '1280px',
        sectionPadding: '4rem',
      },
    },
    tokens: {
      borderRadius: '12px',
      shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      shadowMd: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
  },
};

const DEFAULT_CONFIG: DealerConfig = {
  theme: {
    key: 'base',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '4rem',
    },
  },
  sections: {
    showHero: true,
    showFeatures: true,
    showFooter: true,
    showInventoryLink: true,
    showTestimonials: false,
    showGallery: false,
    showContactForm: true,
  },
  menu: [
    {
      id: '1',
      label: 'Home',
      slug: '',
      target: '_self' as const,
      order: 0,
    },
    {
      id: '2',
      label: 'Inventory',
      slug: 'inventory',
      target: '_self' as const,
      order: 1,
    },
    {
      id: '3',
      label: 'About',
      slug: 'about',
      target: '_self' as const,
      order: 2,
    },
    {
      id: '4',
      label: 'Contact',
      slug: 'contact',
      target: '_self' as const,
      order: 3,
    },
  ],
  tokens: {
    borderRadius: '8px',
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
};

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

export async function getDealerConfig(
  siteSlugOrExternalId: string,
  options: { preview?: boolean } = {}
): Promise<DealerConfig> {

  try {
    // Get dealer info from external API (no local storage)
    const dealer = await dealerService.getDealerById(siteSlugOrExternalId) ||
                   await dealerService.getDealerBySlug(siteSlugOrExternalId);

    if (!dealer) {
      console.warn(`Dealer not found: ${siteSlugOrExternalId}, returning default config`);
      return DEFAULT_CONFIG;
    }

    // Layer 1: Base default config
    let config = { ...DEFAULT_CONFIG };

    // Layer 2: Get base theme from database
    const defaultTheme = await themeService.getDefaultTheme();
    if (defaultTheme) {
      const themeConfig = {
        theme: {
          key: defaultTheme.key,
          colors: defaultTheme.colors,
          typography: defaultTheme.typography,
          spacing: defaultTheme.spacing,
        },
        tokens: defaultTheme.components,
      };
      config = deepMerge(config, themeConfig);
    } else {
      // Fallback to hardcoded base theme if DB is not available
      const baseTheme = BASE_THEMES['base'];
      if (baseTheme) {
        config = deepMerge(config, baseTheme);
      }
    }

    // TODO: Once Prisma client is working, implement:
    // Layer 3: Published customization (always applied)
    // const publishedCustomization = await themeService.getSiteCustomization(siteConfigId, 'PUBLISHED');

    // Layer 4: Draft customization (only if preview mode)
    // if (options.preview) {
    //   const draftCustomization = await themeService.getSiteCustomization(siteConfigId, 'DRAFT');
    // }

    // Validate and parse the final config
    const validatedConfig = DealerConfigSchema.parse(config);

    // Cache the result
    // await setCache(cacheKey, validatedConfig, 300); // 5 minutes

    return validatedConfig;
  } catch (error) {
    console.error('Error getting dealer config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function invalidateDealerCache(dealerId: string): Promise<void> {
  try {
    // If Redis is available, use it for cache invalidation
    const { deleteFromCache } = await import('./redis');
    await deleteFromCache(`dealer:cfg:${dealerId}:*`);

    console.log(`Cache invalidated for dealer: ${dealerId}`);
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

export function generateCSSVars(config: DealerConfig): Record<string, string> {
  return {
    '--color-primary': config.theme.colors.primary,
    '--color-secondary': config.theme.colors.secondary,
    '--color-accent': config.theme.colors.accent,
    '--font-heading': config.theme.typography.headingFont,
    '--font-body': config.theme.typography.bodyFont,
    '--container-width': config.theme.spacing.containerWidth,
    '--section-padding': config.theme.spacing.sectionPadding,
    '--border-radius': config.tokens.borderRadius,
    '--shadow-sm': config.tokens.shadowSm,
    '--shadow-md': config.tokens.shadowMd,
  };
}
