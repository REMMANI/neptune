import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentTenant } from '@/lib/tenant';
import { serverFetch, getCmsApiUrl, getCmsApiToken } from '@/lib/http';
import { CmsBundleSchema } from '@/types/cms';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const { locale } = await params;
    const tenant = await getCurrentTenant();

    // Validate locale
    const supportedLocales = ['en', 'fr', 'es', 'ar'];
    if (!supportedLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale' },
        { status: 400 }
      );
    }

    // Construct external API URL
    const apiUrl = getCmsApiUrl();
    const url = `${apiUrl}/dealers/${tenant.dealerId}/bundle?locale=${locale}`;
    const token = getCmsApiToken();

    // Fetch from external API with caching
    const response = await serverFetch(url, {
      revalidate: 300, // 5 minutes
      tags: [`cms:bundle:${tenant.dealerId}:${locale}`],
      bearerToken: token,
    });

    if (!response.success) {
      // Return mock data if external API fails
      const mockBundle = {
        menu: [
          {
            id: '1',
            label: 'Home',
            slug: '',
            order: 0,
          },
          {
            id: '2',
            label: 'Inventory',
            href: `/${locale}/inventory`,
            order: 1,
          },
          {
            id: '3',
            label: 'About',
            slug: 'about',
            order: 2,
          },
          {
            id: '4',
            label: 'Contact',
            slug: 'contact',
            order: 3,
          },
        ],
        sections: {
          showHero: true,
          showFeatures: true,
          showFooter: true,
          showInventoryLink: true,
          showTestimonials: false,
          showGallery: false,
          showContactForm: true,
        },
        theme: {
          key: tenant.themeKey,
        },
      };

      // Validate mock data
      const validatedBundle = CmsBundleSchema.parse(mockBundle);

      return NextResponse.json(validatedBundle, {
        headers: {
          'Cache-Control': 'public, s-maxage=60', // Shorter cache for fallback
        },
      });
    }

    // Validate response data
    const validatedBundle = CmsBundleSchema.parse(response.data);

    return NextResponse.json(validatedBundle, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('CMS Bundle API error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch CMS bundle' },
      { status: 500 }
    );
  }
}