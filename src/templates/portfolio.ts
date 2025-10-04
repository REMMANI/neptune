const tpl = {
    key: 'portfolio',
    version: '1.0.0',
    name: 'Portfolio',
    defaultTokens: {
        'color-brand-500': '#f97316',
        'color-brand-600': '#ea580c',
        'radius': '20px',
        'font-sans': 'Inter, system-ui',
        'bg': '#ffffff',
        'fg': '#0f172a'
    },
    defaultPages: {
        '/': {
            seo: { title: 'Creative work', description: 'Show your best projects' },
            blocks: [
                { type: 'Footer', props: { brand: { name: 'YourName' } } },
                { type: 'Hero', props: { title: 'I build delightful products', subtitle: 'Designer & Developer' } },
                {
                    type: 'Features', props: {
                        items: [
                            { title: 'Web Apps', description: 'React, Next.js' },
                            { title: 'Branding', description: 'Logos & identity' },
                            { title: 'Motion', description: 'Micro-interactions' }
                        ]
                    }
                },
            ]
        }
    }
};
export default tpl;