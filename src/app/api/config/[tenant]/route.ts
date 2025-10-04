import { NextRequest, NextResponse } from 'next/server';
import { CLIENTS } from '@/data/clients';
import { TEMPLATE_REGISTRY } from '@/templates';
import { mergePages, mergeTokens } from '@/lib/merge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { tenant: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> } // 👈 Next 15 expects a Promise here
) {
  const { tenant } = await context.params; // 👈 await it

  const site = CLIENTS[tenant as keyof typeof CLIENTS];
  if (!site) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const tpl = TEMPLATE_REGISTRY[site.templateKey];
  const tokens = mergeTokens(tpl.defaultTokens, undefined, site.themeOverrides);
  const pages  = mergePages(
    tpl.defaultPages,
    undefined,
    site.pages as typeof tpl.defaultPages
  );

  return NextResponse.json(
    {
      template: { key: tpl.key, name: tpl.name, version: tpl.version },
      tokens,
      pages,
      brand: site.brand,
      localeDefault: site.localeDefault || 'en',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    }
  );
}
