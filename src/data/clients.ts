import { TemplateKey } from '@/templates';


type PageSEO = {
    title?: string;
    description?: string;
    [key: string]: string | undefined;
};

type PageBlock = {
    type: string;
    props?: Record<string, unknown>;
};

export type ClientSite = {
    tenantKey: string;
    primaryDomain?: string;
    templateKey: TemplateKey;
    themeOverrides?: Record<string, string>;
    pages?: Record<string, { seo?: PageSEO; blocks?: PageBlock[] }>;
    localeDefault?: 'en' | 'fr' | 'es' | 'ar';
    brand?: { name: string; logo?: string };
};


export const CLIENTS: Record<string, ClientSite> = {
    demo1: {
        tenantKey: 'demo1',
        templateKey: 'saas',
        brand: { name: 'Acme', logo: '/logo-demo1.svg' },
        themeOverrides: { 'color-brand-500': '#22c55e', 'color-brand-600': '#16a34a' },
        pages: {
            '/': {
                seo: { title: 'Acme — Launch faster', description: 'Multi-tenant demo' },
                blocks: [
                    { type: 'Hero', props: { title: 'Launch faster', subtitle: 'One codebase, many brands' } },
                    { type: 'Footer', props: { brand: { name: 'Acme', logo: '/logo-demo1.svg' } } },
                    {
                        type: 'Features', props: {
                            items: [
                                { title: '10+ templates', description: 'Pick and publish' },
                                { title: 'Overrides', description: 'Tokens/pages/blocks' },
                                { title: 'i18n', description: 'Multi-language routing' }
                            ]
                        }
                    },
                ]
            }
        },
        localeDefault: 'en'
    },
    demo2: {
        tenantKey: 'demo2',
        templateKey: 'clinic',
        brand: { name: 'CarePlus' },
        themeOverrides: { 'radius': '24px' },
        localeDefault: 'fr'
    },
    demo3: {
        tenantKey: 'demo3',
        templateKey: 'portfolio',
        brand: { name: 'Yassine' },
        localeDefault: 'ar'
    }
};