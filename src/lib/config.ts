import 'server-only';
import { DealerConfig, DealerConfigSchema } from '@/types/customization';
import { findDealerById, getDealerCustomization } from './db';
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
  dealerId: string,
  options: { preview?: boolean } = {}
): Promise<DealerConfig> {
  // Try Redis cache first
  // const cacheKey = `dealer:cfg:${dealerId}:${options.preview ? 'preview' : 'published'}`;
  // const cached = await getFromCache<DealerConfig>(cacheKey);
  // if (cached) {
  //   return cached;
  // }

  try {
    // Get dealer info
    const dealer = await findDealerById(dealerId);

    if (!dealer) {
      throw new Error(`Dealer not found: ${dealerId}`);
    }

    // Layer 1: Base default config
    let config = { ...DEFAULT_CONFIG };

    // Layer 2: Base theme config
    const baseTheme = BASE_THEMES[dealer.themeKey];
    if (baseTheme) {
      config = deepMerge(config, baseTheme);
    }

    // Layer 3: Published customization (always applied)
    const publishedCustomization = await getDealerCustomization(dealerId, 'PUBLISHED');

    if (publishedCustomization) {
      config = deepMerge(config, publishedCustomization.data);
    }

    // Layer 4: Draft customization (only if preview mode)
    if (options.preview) {
      const draftCustomization = await getDealerCustomization(dealerId, 'DRAFT');
      if (draftCustomization) {
        config = deepMerge(config, draftCustomization.data);
      }
    }

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
