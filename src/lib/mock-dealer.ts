export type DealerMock = {
  dealerId: number;
  name: string;
  themeKey: 'base' | 't1' | 't2'; 
  languages: string[];
  theme: Record<string, string>;
  logo?: { url: string; alt?: string };
  menu: Array<{ label: Record<string, string>; href: string }>;
  seo?: Record<string, { title?: string; description?: string }>;
  pages?: Record<string, { blocks: Array<{ type: string; props?: Record<string, unknown> }> }>;
  headerVariant?: 'default' | 'premium' | 'banner';
};

const dealers: Record<number, DealerMock> = {
 
  100133: {
    dealerId: 102334,
    name: 'Sunrise Motors',
    themeKey: 'base',
    languages: ['en', 'fr', 'es'],
    theme: {
      'color-brand-500': '#0ea5e9',
      'color-brand-600': '#0284c7',
      'radius': '16px',
      'font-sans': 'Inter, system-ui',
      'bg': '#ffffff',
      'fg': '#0f172a',
    },
    logo: { url: '/logos/sunrise.svg', alt: 'Sunrise Motors' },
    menu: [
      { label: { en: 'Home', fr: 'Accueil', es: 'Inicio' }, href: '/' },
      { label: { en: 'Inventory', fr: 'Stock', es: 'Inventario' }, href: '/inventory' },
      { label: { en: 'Financing', fr: 'Financement', es: 'Financiación' }, href: '/financing' },
    ],
    seo: {
      '/': { title: 'New & Used Cars', description: 'Best deals at Sunrise Motors' },
      '/inventory': { title: 'Inventory', description: 'Browse vehicles' },
      '/financing': { title: 'Financing', description: 'Options that fit you' },
    },
    pages: {
      '/': {
        blocks: [
          { type: 'Hero', props: { title: 'Drive your dreamsss today', subtitle: 'Financing available' } },
          { type: 'Features', props: { items: [
            { title: 'Certified', description: 'Inspected vehicles' },
            { title: 'Warranty',  description: 'Extended coverage' },
            { title: 'Trade-in', description: 'Fair value' },
          ]}},
          { type: 'Footer' },
        ],
      },
      '/inventory': {
        blocks: [
          { type: 'Hero', props: { title: 'Inventory', subtitle: 'Browse all vehicles' } },
          { type: 'Footer' },
        ],
      },
      '/financing': {
        blocks: [
          { type: 'Hero', props: { title: 'Financing', subtitle: 'Options that fit you' } },
          { type: 'Footer' },
        ],
      },
    },
  },

 
  102324: {
    dealerId: 102324,
    name: 'Prime Drive',
    themeKey: 't1',
    languages: ['en', 'fr', 'es'],
    theme: {
      'color-brand-500': '#ef4444',
      'color-brand-600': '#dc2626',
      'radius': '20px',
      'font-sans': 'Inter, system-ui',
      'bg': '#ffffff',
      'fg': '#111827',
    },
    logo: { url: '/logos/prime.svg', alt: 'Prime Drive' },
    menu: [
      { label: { en: 'Home', fr: 'Accueil', es: 'Inicio' }, href: '/' },
      { label: { en: 'Inventory', fr: 'Stock', es: 'Inventario' }, href: '/inventory' },
      { label: { en: 'Offers', fr: 'Offres', es: 'Ofertas' }, href: '/offers' },
      { label: { en: 'Finance', fr: 'finance', es: 'finance' }, href: '/finance' },
    ],
    seo: {
      '/': { title: 'Premium selection', description: 'Exclusive offers for Prime Drive' },
      '/offers': { title: 'Offers', description: 'Limited-time deals' },
    },
    headerVariant: 'premium',
    pages: {
      '/': {
        blocks: [
         
          { type: 'Hero', props: { title: 'Exclusive Header', subtitle: 'dealer contents' } },
          { type: 'Features', props: { items: [
            { title: 'VIP Support', description: 'Priority service' },
            { title: 'Extended Warranty', description: 'Peace of mind' },
            { title: 'Trade-in Bonus', description: 'Extra value' },
          ]}},
          { type: 'Footer' },
        ],
      },
      '/inventory': {
        blocks: [
          { type: 'Hero', props: { title: 'Inventory', subtitle: 'High-end vehicles' } },
          { type: 'Footer' },
        ],
      },
      '/vdp': {
        blocks: [
          { type: 'Hero', props: { title: 'VDP', subtitle: 'honda' } },
          { type: 'Footer' },
        ],
      },
      '/offers': {
        blocks: [
          { type: 'Hero', props: { title: 'Offers', subtitle: 'Limited-time deals' } },
          { type: 'Footer' },
        ],
      },
    },
  },
};

export function getMockDealerConfig(id: number): DealerMock | null {
  return dealers[id] ?? null;
}
