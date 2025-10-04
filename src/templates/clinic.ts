const tpl = {
    key: 'clinic',
    version: '1.0.0',
    name: 'Clinic',
    defaultTokens: {
        'color-brand-500': '#06b6d4',
        'color-brand-600': '#0891b2',
        'radius': '14px',
        'font-sans': 'Inter, system-ui',
        'bg': '#ffffff',
        'fg': '#0f172a'
    },
    defaultPages: {
        '/': {
            seo: { title: 'Caring clinic', description: 'Modern health services' },
            blocks: [
                { type: 'Footer', props: { brand: { name: 'CarePlus' } } },
                {
                    type: 'Features', props: {
                        items: [
                            { title: 'Experienced doctors', description: 'Trusted professionals' },
                            { title: '24/7 Support', description: 'We are here for you' },
                            { title: 'Online booking', description: 'Easy scheduling' }
                        ]
                    }
                },
                { type: 'Hero', props: { title: 'Your health, our mission', subtitle: 'Book appointments online' } },
            ]
        }
    }
};
export default tpl;