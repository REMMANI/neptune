import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentTenant } from '@/lib/tenant';
import { serverFetch, getInventoryApiUrl, getInventoryApiToken } from '@/lib/http';
import { InventoryListSchema, InventorySearchParamsSchema } from '@/types/inventory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = await getCurrentTenant();

    // Parse and validate search parameters
    const rawParams = Object.fromEntries(searchParams.entries());

    // Convert numeric string parameters
    const processedParams = {
      ...rawParams,
      page: rawParams.page ? parseInt(rawParams.page) : undefined,
      pageSize: rawParams.pageSize ? parseInt(rawParams.pageSize) : undefined,
      minPrice: rawParams.minPrice ? parseFloat(rawParams.minPrice) : undefined,
      maxPrice: rawParams.maxPrice ? parseFloat(rawParams.maxPrice) : undefined,
      minYear: rawParams.minYear ? parseInt(rawParams.minYear) : undefined,
      maxYear: rawParams.maxYear ? parseInt(rawParams.maxYear) : undefined,
      maxMileage: rawParams.maxMileage ? parseInt(rawParams.maxMileage) : undefined,
      radius: rawParams.radius ? parseFloat(rawParams.radius) : undefined,
      features: rawParams.features ? rawParams.features.split(',') : undefined,
      tags: rawParams.tags ? rawParams.tags.split(',') : undefined,
    };

    const validatedParams = InventorySearchParamsSchema.parse(processedParams);

    // Construct external API URL
    const apiUrl = getInventoryApiUrl();
    const queryString = new URLSearchParams();

    // Add tenant info
    queryString.set('dealerId', tenant.dealerId);

    // Add search parameters
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          queryString.set(key, value.join(','));
        } else {
          queryString.set(key, value.toString());
        }
      }
    });

    const url = `${apiUrl}/items?${queryString.toString()}`;
    const token = getInventoryApiToken();

    // Fetch from external API with caching
    const response = await serverFetch(url, {
      revalidate: 120, // 2 minutes
      tags: [`inventory:items:${tenant.dealerId}`],
      bearerToken: token,
    });

    if (!response.success) {
      // Return mock data if external API fails
      const mockInventory = {
        items: [
          {
            id: '1',
            title: '2023 Toyota Camry SE',
            description: 'Reliable and fuel-efficient sedan with modern features',
            price: 28500,
            currency: 'USD',
            photos: [
              {
                id: 'p1',
                url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop',
                alt: '2023 Toyota Camry SE',
                order: 0,
                isPrimary: true,
              },
            ],
            attributes: {
              make: 'Toyota',
              model: 'Camry',
              year: 2023,
              trim: 'SE',
              bodyType: 'Sedan',
              engine: '2.5L 4-Cylinder',
              transmission: 'automatic',
              drivetrain: 'fwd',
              fuelType: 'gasoline',
              exteriorColor: 'Super White',
              interiorColor: 'Black',
              doors: 4,
              seats: 5,
            },
            category: 'sedan',
            brand: 'Toyota',
            model: 'Camry',
            year: 2023,
            condition: 'new' as const,
            mileage: 0,
            stockNumber: 'TC2023001',
            availability: 'available' as const,
          },
          {
            id: '2',
            title: '2022 Honda CR-V EX',
            description: 'Spacious SUV perfect for families',
            price: 32000,
            currency: 'USD',
            photos: [
              {
                id: 'p2',
                url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
                alt: '2022 Honda CR-V EX',
                order: 0,
                isPrimary: true,
              },
            ],
            attributes: {
              make: 'Honda',
              model: 'CR-V',
              year: 2022,
              trim: 'EX',
              bodyType: 'SUV',
              engine: '1.5L Turbo',
              transmission: 'automatic',
              drivetrain: 'awd',
              fuelType: 'gasoline',
              exteriorColor: 'Crystal Black Pearl',
              interiorColor: 'Gray',
              doors: 4,
              seats: 5,
            },
            category: 'suv',
            brand: 'Honda',
            model: 'CR-V',
            year: 2022,
            condition: 'used' as const,
            mileage: 15000,
            stockNumber: 'HC2022001',
            availability: 'available' as const,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      const validatedInventory = InventoryListSchema.parse(mockInventory);

      return NextResponse.json(validatedInventory, {
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      });
    }

    // Validate response data
    const validatedInventory = InventoryListSchema.parse(response.data);

    return NextResponse.json(validatedInventory, {
      headers: {
        'Cache-Control': 'public, s-maxage=120',
      },
    });
  } catch (error) {
    console.error('Inventory API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}