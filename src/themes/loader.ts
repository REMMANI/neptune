import { THEME_REGISTRY, type ThemeKey } from './index';
import type { ThemeDescriptor, ThemeTokens, ThemePages, ComponentOverrides, DealerOverrides } from './types';

const DEFAULT_THEME: ThemeKey = 'base';
// Optional alias map for legacy keys:
const THEME_ALIASES: Record<string, ThemeKey> = {
  // classic: 'base',
};

function mergeTokens(...layers: (ThemeTokens|undefined)[]): ThemeTokens {
  return Object.assign({}, ...layers.filter(Boolean));
}
function mergeBlocks(parent: any[] = [], child?: any[]) {
  if (!child) return parent;
  const max = Math.max(parent.length, child.length);
  const out = [];
  for (let i = 0; i < max; i++) out.push(child[i] ?? parent[i]);
  return out.filter(Boolean);
}
function mergePages(parent?: ThemePages, child?: ThemePages): ThemePages {
  const out: ThemePages = {};
  const keys = new Set([...(Object.keys(parent||{})), ...(Object.keys(child||{}))]);
  for (const k of keys) {
    const p = parent?.[k]; const c = child?.[k];
    out[k] = { seo: { ...(p?.seo||{}), ...(c?.seo||{}) }, blocks: mergeBlocks(p?.blocks, c?.blocks) };
  }
  return out;
}
function mergeComponents(parent?: ComponentOverrides, child?: ComponentOverrides): ComponentOverrides {
  return { ...(parent||{}), ...(child||{}) };
}

export type ResolvedTheme = {
  key: string;
  name: string;
  version: string;
  tokens: ThemeTokens;
  pages: ThemePages;
  components: ComponentOverrides;
};

export function resolveTheme(themeKey: ThemeKey | string, dealer?: DealerOverrides): ResolvedTheme {
  // normalize via aliases
  const firstKey = (THEME_ALIASES[themeKey] ?? themeKey) as ThemeKey;

  const seen = new Set<string>();
  const chain: ThemeDescriptor[] = [];

  // Walk up the parent chain
  let cur = THEME_REGISTRY[firstKey] ?? THEME_REGISTRY[DEFAULT_THEME];
  if (!cur) throw new Error('No themes registered');

  while (cur) {
    if (seen.has(cur.key)) {
      const path = [...chain.map(c => c.key), cur.key].join(' -> ');
      throw new Error(`Cyclic theme extends: ${cur.key}\nChain: ${path}`);
    }
    seen.add(cur.key);
    chain.unshift(cur); // parent-first order

    const parentKey = cur.extends as ThemeKey | undefined;
    if (!parentKey) break;
    if (parentKey === cur.key) {
      throw new Error(`Theme "${cur.key}" cannot extend itself`);
    }
    const next = THEME_REGISTRY[parentKey] ?? THEME_REGISTRY[THEME_ALIASES[parentKey] as ThemeKey];
    if (!next) {
      throw new Error(`Theme "${cur.key}" extends unknown theme "${parentKey}"`);
    }
    cur = next;
  }

  // Fold the chain: base → ... → leaf
  let tokens: ThemeTokens = {};
  let pages: ThemePages = {};
  let components: ComponentOverrides = {};
  for (const t of chain) {
    tokens = mergeTokens(tokens, t.tokens);
    pages = mergePages(pages, t.pages);
    components = mergeComponents(components, t.components);
  }

  // Dealer overrides last
  if (dealer) {
    tokens = mergeTokens(tokens, dealer.tokens);
    pages = mergePages(pages, dealer.pages);
    components = mergeComponents(components, dealer.components);
  }

  const leaf = chain.at(-1)!;
  return { key: leaf.key, name: leaf.name, version: leaf.version, tokens, pages, components };
}
