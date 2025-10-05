import 'server-only';

import { THEME_REGISTRY, type ThemeKey } from '@/themes';
import { fetchDealerConfig } from './api';
import { DEALER_OVERRIDES } from '@/dealers/manifest';
import { resolveTheme } from '@/themes/loader';
const FALLBACK_THEME: ThemeKey = 'base';

export const getConfig = (async () => {

  const cfg = await fetchDealerConfig();
  const requested = String(cfg.themeKey || ''); 
  const themeKey = (requested in THEME_REGISTRY ? requested : FALLBACK_THEME) as ThemeKey;

  const dealerMod = (DEALER_OVERRIDES as any)[cfg.dealerId] ? await (DEALER_OVERRIDES as any)[cfg.dealerId]() : null;
  const dealerOverrides = dealerMod?.default;

  const theme = resolveTheme(themeKey, {
    ...(dealerOverrides || {}),
    tokens: { ...(dealerOverrides?.tokens || {}), ...(cfg.theme || {}) },
    pages:  { ...(dealerOverrides?.pages  || {}), ...(cfg.pages || {}) },
  });

  return { raw: cfg, theme };
});
