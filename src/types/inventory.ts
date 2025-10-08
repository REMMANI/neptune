import { z } from 'zod';

// Inventory item schema
export const InventoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  photos: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string().optional(),
    order: z.number().default(0),
    isPrimary: z.boolean().default(false),
  })),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  condition: z.enum(['new', 'used', 'certified']).optional(),
  mileage: z.number().optional(),
  vin: z.string().optional(),
  stockNumber: z.string().optional(),
  availability: z.enum(['available', 'sold', 'pending', 'reserved']).default('available'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// Inventory list schema (paginated response)
export const InventoryListSchema = z.object({
  items: z.array(InventoryItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type InventoryList = z.infer<typeof InventoryListSchema>;

// Search/filter parameters
export const InventorySearchParamsSchema = z.object({
  q: z.string().optional(), // Search query
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  condition: z.enum(['new', 'used', 'certified']).optional(),
  maxMileage: z.number().optional(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  availability: z.enum(['available', 'sold', 'pending', 'reserved']).optional(),
  location: z.string().optional(),
  radius: z.number().optional(), // Search radius in miles/km
  sortBy: z.enum(['price', 'year', 'mileage', 'date', 'title']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export type InventorySearchParams = z.infer<typeof InventorySearchParamsSchema>;

// Vehicle-specific schemas for automotive dealerships
export const VehicleAttributesSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  trim: z.string().optional(),
  bodyType: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.enum(['manual', 'automatic', 'cvt']).optional(),
  drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd']).optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'plugin-hybrid']).optional(),
  fuelEconomyCity: z.number().optional(),
  fuelEconomyHighway: z.number().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  doors: z.number().optional(),
  seats: z.number().optional(),
  cylinders: z.number().optional(),
  displacement: z.number().optional(), // Engine displacement in liters
  horsepower: z.number().optional(),
  torque: z.number().optional(),
});

export type VehicleAttributes = z.infer<typeof VehicleAttributesSchema>;

// Inventory item specialized for vehicles
export const VehicleInventoryItemSchema = InventoryItemSchema.extend({
  attributes: VehicleAttributesSchema,
  vehicleHistory: z.object({
    accidents: z.number().default(0),
    owners: z.number().default(1),
    serviceRecords: z.number().default(0),
    recalls: z.array(z.string()).optional(),
  }).optional(),
  warranty: z.object({
    basic: z.string().optional(),
    powertrain: z.string().optional(),
    roadside: z.string().optional(),
    corrosion: z.string().optional(),
  }).optional(),
});

export type VehicleInventoryItem = z.infer<typeof VehicleInventoryItemSchema>;

// Filter/facet response for inventory search
export const InventoryFacetsSchema = z.object({
  brands: z.array(z.object({
    value: z.string(),
    count: z.number(),
  })),
  categories: z.array(z.object({
    value: z.string(),
    count: z.number(),
  })),
  priceRanges: z.array(z.object({
    min: z.number(),
    max: z.number(),
    count: z.number(),
  })),
  yearRanges: z.array(z.object({
    min: z.number(),
    max: z.number(),
    count: z.number(),
  })),
  conditions: z.array(z.object({
    value: z.string(),
    count: z.number(),
  })),
  features: z.array(z.object({
    value: z.string(),
    count: z.number(),
  })),
});

export type InventoryFacets = z.infer<typeof InventoryFacetsSchema>;