import React, { Suspense } from 'react';
import { Metadata } from 'next/metadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, t } from '@/lib/i18n';
import { getCurrentTenant } from '@/lib/tenant';

interface InventoryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: InventoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const tenant = await getCurrentTenant();

  if (!isValidLocale(locale)) {
    return { title: 'Invalid Locale' };
  }

  return {
    title: `${t('nav.inventory', locale)} - Dealership CMS`,
    description: 'Browse our extensive inventory of quality vehicles with detailed specifications and photos.',
    openGraph: {
      title: `Vehicle Inventory - Dealership ${tenant.dealerId}`,
      description: 'Explore our wide selection of vehicles with competitive pricing and financing options.',
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/inventory`,
    },
  };
}

async function InventoryList({ searchParams, locale }: { searchParams: any; locale: string }) {
  const tenant = await getCurrentTenant();

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      queryParams.set(key, value);
    }
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/inventory/items?${queryParams.toString()}`,
      {
        next: {
          revalidate: 120,
          tags: [`inventory:items:${tenant.dealerId}`]
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }

    const inventory = await response.json();

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Inventory Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('nav.inventory', locale)}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {inventory.total} vehicles available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Make, model, year..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                id="minPrice"
                placeholder="0"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                id="maxPrice"
                placeholder="100000"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        {inventory.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inventory.items.map((item: any) => (
              <Link
                key={item.id}
                href={`/${locale}/inventory/${item.id}`}
                className="group block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-300"
              >
                {/* Vehicle Image */}
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  {item.photos?.[0] && (
                    <img
                      src={item.photos[0].url}
                      alt={item.photos[0].alt || item.title}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Price and Key Details */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      ${item.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-gray-500">
                      {item.year} • {item.mileage?.toLocaleString()} mi
                    </div>
                  </div>

                  {/* Key Features */}
                  {item.attributes && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.attributes.transmission && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {item.attributes.transmission}
                        </span>
                      )}
                      {item.attributes.fuelType && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {item.attributes.fuelType}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting your search criteria or browse all inventory.
            </p>
          </div>
        )}

        {/* Pagination */}
        {inventory.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {inventory.hasPrev && (
                <Link
                  href={`/${locale}/inventory?page=${inventory.page - 1}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              <span className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Page {inventory.page} of {inventory.totalPages}
              </span>
              {inventory.hasNext && (
                <Link
                  href={`/${locale}/inventory?page=${inventory.page + 1}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('common.error', locale)}
          </h1>
          <p className="text-gray-600">
            Unable to load inventory. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

function InventoryLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function InventoryPage({ params, searchParams }: InventoryPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div>
      <Suspense fallback={<InventoryLoadingSkeleton />}>
        <InventoryList searchParams={resolvedSearchParams} locale={locale} />
      </Suspense>
    </div>
  );
}
