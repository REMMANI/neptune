// src/themes/types.ts
import type { AnyBlock } from '@/blocks';

export type ThemeTokens = Record<string, string>;
export type ThemePages = Record<string, { seo?: Record<string, unknown>; blocks: AnyBlock[] }>;
export type ComponentOverrides = {
  [blockType: string]: () => Promise<{ default: React.ComponentType<any> }>;
};

export type ThemeDescriptor = {
  key: string;
  name: string;
  version: string;
  extends?: string;             // parent key, e.g. 'base' or 't1'
  tokens?: ThemeTokens;
  pages?: ThemePages;
  components?: ComponentOverrides; // per-theme component shadowing
};

export type DealerOverrides = {
  tokens?: ThemeTokens;
  pages?: ThemePages;
  components?: ComponentOverrides;
};