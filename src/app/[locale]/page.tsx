import { getConfig } from '@/lib/config';
import { RenderBlocks } from '@/components/RenderBlocks';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { theme, raw } = await getConfig();
  const page = theme.pages['/'];               

  if (!page) {
   
    throw new Error('Home page not defined in theme.pages');
  }

  return (
    <main>
      <RenderBlocks
        blocks={page.blocks}
        theme={theme} 
        brand={{ name: raw.name, logo: raw.logo?.url }}
        locale={locale}
      />
    </main>
  );
}
