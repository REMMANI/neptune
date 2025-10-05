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
  const { theme, raw } = await getConfig();      
  const page = theme.pages['/inventory'];                 

  if (!page) {
    
    
    throw new Error('Home page not defined in theme.pages');
  }

    return (
        <main>
            <RenderBlocks
                blocks={page.blocks}                 
                locale={locale}
                brand={{ name: raw.name, logo: raw.logo?.url }}
            />
        </main>
    );
}
