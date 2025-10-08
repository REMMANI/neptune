export type Tokens = Record<string, string>;
export type SEO = { title?: string; description?: string; [key: string]: unknown };
export type Block = { type: string; content?: unknown; [key: string]: unknown };
export type Page = { seo?: SEO; blocks: Block[] };


export function mergeTokens(base: Tokens, variant?: Tokens, overrides?: Tokens): Tokens {
    return { ...(base || {}), ...(variant || {}), ...(overrides || {}) };
}


export function mergePages(
    base: Record<string, Page>,
    variant?: Record<string, Partial<Page>>,
    client?: Record<string, Partial<Page>>
): Record<string, Page> {
    const out: Record<string, Page> = { ...base };
    const apply = (delta?: Record<string, Partial<Page>>) => {
        if (!delta) return;
        for (const slug of Object.keys(delta)) {
            const current = out[slug] ?? { blocks: [] };
            const d = delta[slug]!;
            out[slug] = {
                seo: { ...(current.seo || {}), ...(d.seo || {}) },
                blocks: Array.isArray(d.blocks) ? d.blocks : current.blocks,
            };
        }
    };
    apply(variant);
    apply(client);
    return out;
}