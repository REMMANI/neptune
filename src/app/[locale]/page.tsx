import { RenderBlocks } from '@/components/RenderBlocks';
import ThemeStyle from '@/components/ThemeStyle';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import { getTenantConfig } from '@/lib/config';


export default async function Page({ params, searchParams }: { params: Promise<{ locale: Locale }>, searchParams: Promise<{ tenant?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = SUPPORTED_LOCALES.includes(resolvedParams.locale) ? resolvedParams.locale : 'en';
  const DEFAULT_TENANT = 'demo1';
  const tenant = resolvedSearchParams?.tenant || DEFAULT_TENANT;
  console.log('Rendering locale', locale, 'for tenant', tenant);

  const cfg = await getTenantConfig(tenant);
  const page = cfg.pages['/'];
  return (
    <main>
      <ThemeStyle tokens={cfg.tokens} />
      <RenderBlocks blocks={page.blocks} locale={locale} />
    </main>
  );
}