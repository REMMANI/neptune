export async function getTenantConfig(tenant: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/config/${tenant}`, {
        // Next.js RSC fetch: cache defaults are fine for demo
        next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Config fetch failed');
    return res.json();
}