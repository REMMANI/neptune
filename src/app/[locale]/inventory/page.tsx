import { getConfig } from '@/lib/config';
import { RenderBlocks } from '@/components/RenderBlocks';

export const dynamic = 'force-static';
export const revalidate = false;

export default async function Inventory({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { theme, raw } = await getConfig();      // ← theme, not pages
  const page = theme.pages['/inventory'];                 // ← use theme.pages

  if (!page) {
    // Optional: surface a 404 if the slug isn't defined in the theme
    // import { notFound } from 'next/navigation'; notFound();
    throw new Error('Home page not defined in theme.pages');
  }

    return (
        <main>
            <RenderBlocks
                blocks={page.blocks}                 // can be unknown-ish; we normalize inside
                locale={locale}
                brand={{ name: raw.name, logo: raw.logo?.url }}
            />
        </main>
    );
}
