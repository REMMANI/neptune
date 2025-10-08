import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import { isValidLocale } from '@/lib/i18n';
import RenderBlocks from '@/components/blocks/RenderBlocks';

interface CmsPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tenant = await getCurrentTenant();

  if (!isValidLocale(locale)) {
    return { title: 'Invalid Locale' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cms/page/${locale}/${slug?.join('/') || ''}`,
      { next: { revalidate: 300 } }
    );

    if (response.ok) {
      const page = await response.json();
      return {
        title: page.title,
        description: page.description,
        openGraph: {
          title: page.ogTitle || page.title,
          description: page.ogDescription || page.description,
          images: page.ogImage ? [{ url: page.ogImage }] : [],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: page.title,
          description: page.description,
          images: page.ogImage ? [page.ogImage] : [],
        },
        alternates: {
          canonical: page.canonical,
        },
        robots: {
          index: !page.noIndex,
          follow: true,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { locale, slug } = await params;
  const tenant = await getCurrentTenant();

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Fetch page data and CMS bundle in parallel
  const [pageResponse, bundleResponse] = await Promise.allSettled([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cms/page/${locale}/${slug?.join('/') || ''}`,
      {
        next: {
          revalidate: 300,
          tags: [`cms:page:${tenant.dealerId}:${locale}:${slug?.join('/') || 'home'}`]
        }
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cms/bundle/${locale}`,
      {
        next: {
          revalidate: 300,
          tags: [`cms:bundle:${tenant.dealerId}:${locale}`]
        }
      }
    ),
  ]);

  // Handle page response
  if (pageResponse.status === 'rejected' || !pageResponse.value.ok) {
    console.error('Failed to fetch page data');
    notFound();
  }

  const page = await pageResponse.value.json();

  // Handle bundle response with fallback
  let cmsBundle;
  if (bundleResponse.status === 'fulfilled' && bundleResponse.value.ok) {
    cmsBundle = await bundleResponse.value.json();
  } else {
    // Fallback bundle
    cmsBundle = {
      sections: {
        showHero: true,
        showFeatures: true,
        showFooter: true,
        showInventoryLink: true,
        showTestimonials: false,
        showGallery: false,
        showContactForm: true,
      },
    };
  }

  return (
    <article>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: page.description,
            url: page.canonical || `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/${slug?.join('/') || ''}`,
            inLanguage: locale,
            isPartOf: {
              '@type': 'WebSite',
              name: 'Dealership CMS',
              url: process.env.NEXT_PUBLIC_APP_URL,
            },
            datePublished: page.publishedAt,
            dateModified: page.updatedAt,
          }),
        }}
      />

      {/* Page content */}
      <RenderBlocks
        blocks={page.blocks}
        activatedSections={cmsBundle.sections}
      />

      {/* Custom CSS if provided */}
      {page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      )}

      {/* Custom JS if provided */}
      {page.customJs && (
        <script dangerouslySetInnerHTML={{ __html: page.customJs }} />
      )}
    </article>
  );
}