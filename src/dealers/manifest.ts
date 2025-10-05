export const DEALER_OVERRIDES = {
    102324: () => import('./102324/index'),
    // 555000: () => import('./555000/index'),
} as const;

export type DealerWithOverrides = keyof typeof DEALER_OVERRIDES;
