import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import { resolveComponent } from '@/lib/theme';
import { getDealerConfig, generateCSSVars } from '@/lib/config';
import { isValidLocale, Locale } from '@/lib/i18n';
import '../globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const tenant = await getCurrentTenant();

  if (!isValidLocale(locale)) {
    return {
      title: 'Invalid Locale',
    };
  }

  return {
    title: {
      template: '%s | Dealership CMS',
      default: 'Dealership CMS - Multi-Tenant Auto Dealer Platform',
    },
    description: 'Professional automotive dealership platform with inventory management and CMS',
    viewport: 'width=device-width, initial-scale=1',
    icons: {
      icon: '/favicon.ico',
    },
    alternates: {
      languages: {
        en: '/en',
        fr: '/fr',
        es: '/es',
        ar: '/ar',
      },
    },
    other: {
      'X-Dealer-ID': tenant.dealerId,
      'X-Theme': tenant.themeKey,
    },
  };
}

interface LayoutComponentsProps {
  locale: Locale;
  children: React.ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function LayoutComponents({ locale, children, searchParams }: LayoutComponentsProps) {
  const tenant = await getCurrentTenant();
  const preview = searchParams?.preview === '1';

  // Get dealer configuration with CSS variables
  const config = await getDealerConfig(tenant.dealerId, { preview });
  const cssVars = generateCSSVars(config);

  // Resolve theme components
  const MainNavComponent = await resolveComponent('MainNav', tenant);
  const FooterComponent = await resolveComponent('Footer', tenant);

  return (
    <div className="min-h-screen flex flex-col" style={cssVars}>
      <header>
        <MainNavComponent menu={config.menu} locale={locale} />
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {config.sections.showFooter && (
        <FooterComponent locale={locale} dealerId={tenant.dealerId} />
      )}
    </div>
  );
}

export default async function RootLayout({ children, params, searchParams }: RootLayoutProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        <LayoutComponents locale={locale} searchParams={resolvedSearchParams}>
          {children}
        </LayoutComponents>
      </body>
    </html>
  );
}