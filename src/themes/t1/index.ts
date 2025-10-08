import type { ThemeDescriptor } from '../types';
import type { AnyBlock } from '@/blocks';

const t1: ThemeDescriptor = {
  key: 't1',
  name: 'Theme T1 (child of base)',
  version: '1.0.0',
  extends: 'base',

  tokens: {
    'color-brand-500': '#6366f1',
    'color-brand-600': '#4f46e5',
    'radius': '18px',
  },
  pages: {
    '/': {
      blocks: [
        { type: 'Hero', props: { title: 'T1 — Faster & Sleeker', subtitle: 'Child theme of base' } },
      ] satisfies AnyBlock[],
    },
  },
};

export default t1;
