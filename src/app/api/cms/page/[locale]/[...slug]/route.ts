import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentTenant } from '@/lib/tenant';
import { serverFetch, getCmsApiUrl, getCmsApiToken } from '@/lib/http';
import { PageSchema } from '@/types/cms';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string; slug: string[] } }
) {
  try {
    const { locale, slug } = await params;
    const tenant = await getCurrentTenant();

    // Validate locale
    const supportedLocales = ['en', 'fr', 'es', 'ar'];
    if (!supportedLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale' },
        { status: 400 }
      );
    }

    // Handle root path
    const slugPath = slug?.length ? slug.join('/') : 'home';

    // Construct external API URL
    const apiUrl = getCmsApiUrl();
    const url = `${apiUrl}/dealers/${tenant.dealerId}/pages/${locale}/${slugPath}`;
    const token = getCmsApiToken();

    // Fetch from external API with caching
    const response = await serverFetch(url, {
      revalidate: 300, // 5 minutes
      tags: [`cms:page:${tenant.dealerId}:${locale}:${slugPath}`],
      bearerToken: token,
    });

    if (!response.success) {
      // Return mock data for common pages
      if (slugPath === 'home' || slugPath === '') {
        const mockHomePage = {
          id: '1',
          locale,
          slug: [''],
          title: 'Welcome to Our Dealership',
          description: 'Find your perfect vehicle with our extensive inventory and expert service.',
          blocks: [
            {
              type: 'hero' as const,
              id: 'hero-1',
              title: 'Find Your Perfect Vehicle',
              subtitle: 'Explore our extensive inventory of quality vehicles',
              image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200&h=600&fit=crop',
              ctaText: 'Browse Inventory',
              ctaLink: `/${locale}/inventory`,
            },
            {
              type: 'features' as const,
              id: 'features-1',
              title: 'Why Choose Us',
              items: [
                {
                  id: 'f1',
                  title: 'Quality Vehicles',
                  description: 'Every vehicle in our inventory is thoroughly inspected',
                  icon: 'check-circle',
                },
                {
                  id: 'f2',
                  title: 'Expert Service',
                  description: 'Our experienced team is here to help you find the perfect vehicle',
                  icon: 'users',
                },
                {
                  id: 'f3',
                  title: 'Competitive Pricing',
                  description: 'We offer fair and transparent pricing on all our vehicles',
                  icon: 'dollar-sign',
                },
              ],
            },
          ],
        };

        const validatedPage = PageSchema.parse(mockHomePage);
        return NextResponse.json(validatedPage);
      }

      // Return 404 for other pages when API fails
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Validate response data
    const validatedPage = PageSchema.parse(response.data);

    return NextResponse.json(validatedPage, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('CMS Page API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid page data format' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}