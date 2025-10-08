import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Get all page slugs from external CMS API or fallback to static pages
    const staticPages = [
      {
        url: `${baseUrl}/en`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/en/about`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/en/inventory`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
    ];

    // Add localized versions
    const locales = ['en', 'fr', 'es', 'ar'];
    const localizedPages: MetadataRoute.Sitemap = [];

    staticPages.forEach((page) => {
      locales.forEach((locale) => {
        localizedPages.push({
          ...page,
          url: page.url.replace('/en', `/${locale}`),
        });
      });
    });

    // Try to get inventory items for additional sitemap entries
    try {
      const inventoryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/inventory/items?pageSize=100`,
        { next: { revalidate: 3600 } }
      );

      if (inventoryResponse.ok) {
        const inventory = await inventoryResponse.json();
        inventory.items.forEach((item: any) => {
          locales.forEach((locale) => {
            localizedPages.push({
              url: `${baseUrl}/${locale}/inventory/${item.id}`,
              lastModified: new Date(item.updatedAt || new Date()),
              changeFrequency: 'daily' as const,
              priority: 0.7,
            });
          });
        });
      }
    } catch (error) {
      console.warn('Could not fetch inventory for sitemap:', error);
    }

    return localizedPages;
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Fallback sitemap
    return [
      {
        url: `${baseUrl}/en`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
