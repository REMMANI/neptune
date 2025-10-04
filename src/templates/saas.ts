const tpl = {
    key: 'saas',
    version: '1.0.0',
    name: 'SaaS Starter',
    defaultTokens: {
        'color-brand-500': '#6366f1',
        'color-brand-600': '#4f46e5',
        'radius': '16px',
        'font-sans': 'Inter, system-ui',
        'bg': '#ffffff',
        'fg': '#0f172a'
    },
    defaultPages: {
        '/': {
            seo: { title: 'Grow faster', description: 'Launch your SaaS quickly.' },
            blocks: [
                { type: 'Footer', props: { brand: { name: 'Acme' } } },
                { type: 'Hero', props: { title: 'Grow faster', subtitle: 'Launch in days, not months.' } },
                {
                    type: 'Features', props: {
                        items: [
                            { title: 'Templates', description: 'Pick from many templates' },
                            { title: 'Theming', description: 'Brand colors & fonts via tokens' },
                            { title: 'SEO-ready', description: 'SSR metadata per page' }
                        ]
                    }
                },
                {
                    type: 'Pricing', props: {
                        plans: [
                            { name: 'Starter', price: '$9', features: ['Basic blocks', 'Email support'] },
                            { name: 'Pro', price: '$29', features: ['All blocks', 'Priority support'] },
                            { name: 'Business', price: '$99', features: ['SLA', 'Customizations'] }
                        ]
                    }
                },
            ]
        }
    }
};
export default tpl;