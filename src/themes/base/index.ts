import type { ThemeDescriptor } from '../types';

const base: ThemeDescriptor = {
  key: 'base',
  name: 'Base Theme',
  version: '1.0.0',
  tokens: {
    'color-brand-500': '#0ea5e9',
    'color-brand-600': '#0284c7',
    'radius': '16px',
    'font-sans': 'Inter, system-ui',
    'bg': '#ffffff',
    'fg': '#0f172a',
  },
  pages: {
    '/': {
      blocks: [
        { type: 'Hero', props: { title: 'Drive better', subtitle: 'Finance available' } },
        { type: 'Footer' },
      ],
    },
    '/inventory': {
      blocks: [
        { type: 'Hero', props: { title: 'Inventory', subtitle: 'Browse all vehicles' } },
        { type: 'Footer' },
      ],
    },
  },
};

export default base;
