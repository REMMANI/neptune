import base from './base';
import t1   from './t1';

export const THEME_REGISTRY = {
  base,
  t1
} as const;

export type ThemeKey = keyof typeof THEME_REGISTRY;
