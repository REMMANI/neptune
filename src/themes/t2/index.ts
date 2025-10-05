// src/themes/t1/index.ts
import type { ThemeDescriptor } from '../types';
import type { AnyBlock } from '@/blocks';

const t1: ThemeDescriptor = {
  key: 't1',
  name: 'Theme T1 (child of base)',
  version: '1.0.0',
  extends: 'base', // 👈 inherit from parent "base"

  // 1) Token tweaks (CSS variables)
  tokens: {
    'color-brand-500': '#6366f1',
    'color-brand-600': '#4f46e5',
    'radius': '18px',
    // leave others to inherit from base
  },

  // 2) Page/blocks overrides (only what you need)
  pages: {
    '/': {
      // Only replace the first block; rest will merge from base
      blocks: [
        { type: 'Hero', props: { title: 'T1 — Faster & Sleeker', subtitle: 'Child theme of base' } },
        // If you want to fully reorder, list all blocks here.
      ] satisfies AnyBlock[],
      // You can also override SEO:
      // seo: { title: 'T1 Home', description: 'Child theme landing' },
    },

    // Example: add/override inventory title
    '/inventory': {
      blocks: [
        { type: 'Hero', props: { title: 'Inventory — T1', subtitle: 'Curated vehicles' } },
        // Footer will be inherited if not provided here
      ] satisfies AnyBlock[],
    },
  },

  // 3) Component shadowing (optional)
  // If you want a different Hero only in T1, create: src/themes/t1/components/hero.tsx
  // that default-exports a React component (props compatible with base Hero)
  components: {
    // 'Hero': () => import('./components/hero'),
  },
};

export default t1;
