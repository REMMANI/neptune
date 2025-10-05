// src/app/api/config/[tenant]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CLIENTS } from '@/data/clients';
import { THEME_REGISTRY } from '@/themes'; // ← not THEME_REGISTRY
import { mergePages, mergeTokens, type Page } from '@/lib/merge'; // ← import Page

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { tenant: string };

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { tenant } = await ctx.params;

  const site = CLIENTS[tenant as keyof typeof CLIENTS];
  if (!site) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const theme = THEME_REGISTRY[site.themeKey];
  const tokens = mergeTokens(theme.defaultTokens, site.themeOverrides);
  const pages  = mergePages(
    theme.defaultPages as Record<string, Page>,                     // 👈 cast base
    site.pages as Record<string, Partial<Page>> | undefined  
  );

  return NextResponse.json(
    {
      theme: { key: theme.key, name: theme.name, version: theme.version },
      tokens,
      pages,
      brand: site.brand,
      localeDefault: site.localeDefault || 'en',
    },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=600' } }
  );
}
