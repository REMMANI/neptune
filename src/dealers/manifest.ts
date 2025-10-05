export const DEALER_OVERRIDES = {
    102324: () => import('./102324/index'),
    100133: () => import('./100133/index'),
} as const;

export type DealerWithOverrides = keyof typeof DEALER_OVERRIDES;
