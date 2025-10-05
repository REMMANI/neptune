import 'server-only';


const BASE = process.env.DEALER_API_BASE!;
const DEALER_ID = process.env.NEXT_PUBLIC_DEALER_ID!; // provided at build


export type DealerConfig = {
    dealerId: number;
    name: string;
    themeKey: string;
    languages: string[]; // e.g. ["en","fr","es"]
    theme: Record<string, string>;
    logo?: { url: string; alt?: string };
    menu: Array<{ label: Record<string, string>; href: string }>;
    seo?: Record<string, { title?: string; description?: string }>;
    pages?: Record<string, { blocks: unknown[] }>;
};


export async function fetchDealerConfig(): Promise<DealerConfig> {
    if (!BASE || !DEALER_ID) throw new Error('Missing DEALER_API_BASE or NEXT_PUBLIC_DEALER_ID');
    const res = await fetch(`${BASE}/dealers/${DEALER_ID}/site-config`, {
        // Build-time fetch: make it cacheable for the build
        cache: 'no-store',
        // If you want ISR later, you can add: next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
    return res.json();
}