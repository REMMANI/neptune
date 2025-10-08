import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentTenant } from '@/lib/tenant';
import { serverFetch, getInventoryApiUrl, getInventoryApiToken } from '@/lib/http';
import { InventoryItemSchema } from '@/types/inventory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tenant = await getCurrentTenant();

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Construct external API URL
    const apiUrl = getInventoryApiUrl();
    const url = `${apiUrl}/items/${id}?dealerId=${tenant.dealerId}`;
    const token = getInventoryApiToken();

    // Fetch from external API with caching
    const response = await serverFetch(url, {
      revalidate: 120, // 2 minutes
      tags: [`inventory:item:${id}`, `inventory:items:${tenant.dealerId}`],
      bearerToken: token,
    });

    if (!response.success) {
      // Return mock data for demo purposes
      if (id === '1' || id === '2') {
        const mockItems: Record<string, any> = {
          '1': {
            id: '1',
            title: '2023 Toyota Camry SE',
            description: 'This reliable and fuel-efficient sedan features modern technology and safety features. Perfect for daily commuting and long road trips.',
            price: 28500,
            currency: 'USD',
            photos: [
              {
                id: 'p1',
                url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200&h=800&fit=crop',
                alt: '2023 Toyota Camry SE Front View',
                order: 0,
                isPrimary: true,
              },
              {
                id: 'p2',
                url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=800&fit=crop',
                alt: '2023 Toyota Camry SE Interior',
                order: 1,
                isPrimary: false,
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
              fuelEconomyCity: 28,
              fuelEconomyHighway: 39,
              exteriorColor: 'Super White',
              interiorColor: 'Black',
              doors: 4,
              seats: 5,
              cylinders: 4,
              displacement: 2.5,
              horsepower: 203,
              torque: 184,
            },
            category: 'sedan',
            brand: 'Toyota',
            model: 'Camry',
            year: 2023,
            condition: 'new' as const,
            mileage: 0,
            vin: '4T1C11AK5PU123456',
            stockNumber: 'TC2023001',
            availability: 'available' as const,
            features: ['Backup Camera', 'Bluetooth', 'Apple CarPlay', 'Lane Departure Warning', 'Automatic Emergency Braking'],
            tags: ['fuel-efficient', 'reliable', 'technology'],
            publishedAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z',
            seoTitle: '2023 Toyota Camry SE - Reliable Sedan for Sale',
            seoDescription: 'Discover the 2023 Toyota Camry SE with modern features and excellent fuel economy. Contact us for pricing and availability.',
          },
          '2': {
            id: '2',
            title: '2022 Honda CR-V EX',
            description: 'Spacious SUV perfect for families with all-wheel drive capability and premium interior features.',
            price: 32000,
            currency: 'USD',
            photos: [
              {
                id: 'p3',
                url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop',
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
              fuelEconomyCity: 27,
              fuelEconomyHighway: 32,
              exteriorColor: 'Crystal Black Pearl',
              interiorColor: 'Gray',
              doors: 4,
              seats: 5,
              cylinders: 4,
              displacement: 1.5,
              horsepower: 190,
              torque: 179,
            },
            category: 'suv',
            brand: 'Honda',
            model: 'CR-V',
            year: 2022,
            condition: 'used' as const,
            mileage: 15000,
            vin: '2HKRW2H85NH123456',
            stockNumber: 'HC2022001',
            availability: 'available' as const,
            features: ['All-Wheel Drive', 'Sunroof', 'Heated Seats', 'Remote Start', 'Honda Sensing Suite'],
            tags: ['family-friendly', 'awd', 'spacious'],
            publishedAt: '2024-01-10T08:00:00Z',
            updatedAt: '2024-01-18T16:45:00Z',
            seoTitle: '2022 Honda CR-V EX AWD - Family SUV for Sale',
            seoDescription: 'Explore the 2022 Honda CR-V EX with all-wheel drive and premium features perfect for families.',
          },
        };

        const mockItem = mockItems[id];
        if (mockItem) {
          const validatedItem = InventoryItemSchema.parse(mockItem);
          return NextResponse.json(validatedItem);
        }
      }

      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Validate response data
    const validatedItem = InventoryItemSchema.parse(response.data);

    return NextResponse.json(validatedItem, {
      headers: {
        'Cache-Control': 'public, s-maxage=120',
      },
    });
  } catch (error) {
    console.error('Inventory Item API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data format' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}