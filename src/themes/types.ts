
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
  extends?: string;             
  tokens?: ThemeTokens;
  pages?: ThemePages;
  components?: ComponentOverrides; 
};

export type DealerOverrides = {
  tokens?: ThemeTokens;
  pages?: ThemePages;
  components?: ComponentOverrides;
};