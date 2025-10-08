export const dealerManifest = {
  '102324': {
    name: 'Premium Motors',
    hasCustomComponents: true,
    hasCustomStyles: true,
    themeKey: 't1',
    customizations: {
      hero: true,
      nav: false,
      footer: false,
    },
  },
  '100133': {
    name: 'Classic Auto',
    hasCustomComponents: false,
    hasCustomStyles: false,
    themeKey: 'base',
    customizations: {},
  },
} as const;

export type DealerId = keyof typeof dealerManifest;

export function getDealerInfo(dealerId: string) {
  return dealerManifest[dealerId as DealerId] || null;
}

export const DEALER_OVERRIDES = {
    102324: () => import('./102324/index'),
    100133: () => import('./100133/index'),
} as const;

export type DealerWithOverrides = keyof typeof DEALER_OVERRIDES;
