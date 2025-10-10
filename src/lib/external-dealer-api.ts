// Mock external API service for dealer information
// In production, this would connect to actual external dealer management system

export interface ExternalDealerInfo {
  dealerId: string;
  businessInfo: {
    legalName: string;
    displayName: string;
    tradingName?: string;
    businessLicense: string;
  };
  contactDetails: {
    primaryEmail: string;
    primaryPhone: string;
    websiteUrl?: string;
  };
  locationInfo: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  businessDetails: {
    establishedYear: number;
    businessType: string;
    specializations: string[];
    serviceAreas: string[];
  };
  operationalInfo: {
    status: 'active' | 'inactive' | 'suspended';
    workingHours: {
      [day: string]: { open: string; close: string; closed?: boolean };
    };
    servicesOffered: string[];
  };
  brandPartnerships: {
    manufacturer: string;
    partnershipType: string;
    certifications: string[];
  }[];
}

// Mock dealer data that would typically come from external API
const mockDealerDatabase: ExternalDealerInfo[] = [
  {
    dealerId: 'PMV-2024-001',
    businessInfo: {
      legalName: 'Premium Motors & Luxury Vehicles LLC',
      displayName: 'Premium Motors',
      tradingName: 'Premium Luxury Auto',
      businessLicense: 'CAL-DEALER-90210-2024'
    },
    contactDetails: {
      primaryEmail: 'info@premium-motors.com',
      primaryPhone: '(555) 123-4567',
      websiteUrl: 'https://premium-motors.com'
    },
    locationInfo: {
      streetAddress: '1245 Luxury Auto Boulevard',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      coordinates: {
        latitude: 34.0736,
        longitude: -118.4004
      }
    },
    businessDetails: {
      establishedYear: 1995,
      businessType: 'luxury_dealership',
      specializations: ['luxury_vehicles', 'exotic_cars', 'premium_service'],
      serviceAreas: ['Beverly Hills', 'West Hollywood', 'Santa Monica', 'Malibu']
    },
    operationalInfo: {
      status: 'active',
      workingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '10:00', close: '17:00' }
      },
      servicesOffered: ['sales', 'financing', 'service_maintenance', 'parts', 'detailing', 'trade_in_evaluation']
    },
    brandPartnerships: [
      {
        manufacturer: 'Mercedes-Benz',
        partnershipType: 'authorized_dealer',
        certifications: ['AMG_specialist', 'electric_vehicle_certified']
      },
      {
        manufacturer: 'BMW',
        partnershipType: 'certified_dealer',
        certifications: ['M_series_expert', 'electric_vehicle_certified']
      }
    ]
  },
  {
    dealerId: 'SFD-2024-002',
    businessInfo: {
      legalName: 'Sunshine Ford Dealership Inc',
      displayName: 'Sunshine Ford',
      businessLicense: 'FL-DEALER-33101-2024'
    },
    contactDetails: {
      primaryEmail: 'sales@sunshine-ford.com',
      primaryPhone: '(555) 987-6543',
      websiteUrl: 'https://sunshine-ford.com'
    },
    locationInfo: {
      streetAddress: '789 Biscayne Boulevard',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
      coordinates: {
        latitude: 25.7617,
        longitude: -80.1918
      }
    },
    businessDetails: {
      establishedYear: 1982,
      businessType: 'franchise_dealership',
      specializations: ['ford_vehicles', 'fleet_sales', 'commercial_vehicles'],
      serviceAreas: ['Miami', 'Miami Beach', 'Coral Gables', 'Aventura', 'Kendall']
    },
    operationalInfo: {
      status: 'active',
      workingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '19:00' },
        sunday: { open: '10:00', close: '18:00' }
      },
      servicesOffered: ['sales', 'financing', 'service_maintenance', 'parts', 'fleet_management', 'commercial_leasing']
    },
    brandPartnerships: [
      {
        manufacturer: 'Ford Motor Company',
        partnershipType: 'authorized_franchise',
        certifications: ['ford_certified', 'ev_specialist', 'commercial_expert']
      }
    ]
  },
  {
    dealerId: 'MVC-2024-003',
    businessInfo: {
      legalName: 'Mountain View Chevrolet Center LLC',
      displayName: 'Mountain View Chevrolet',
      tradingName: 'MV Chevy',
      businessLicense: 'CO-DEALER-80202-2024'
    },
    contactDetails: {
      primaryEmail: 'contact@mountain-chevy.com',
      primaryPhone: '(555) 456-7890',
      websiteUrl: 'https://mountain-chevy.com'
    },
    locationInfo: {
      streetAddress: '2100 Mountain View Road',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA',
      coordinates: {
        latitude: 39.7392,
        longitude: -104.9903
      }
    },
    businessDetails: {
      establishedYear: 2001,
      businessType: 'franchise_dealership',
      specializations: ['chevrolet_vehicles', 'electric_vehicles', 'truck_specialist'],
      serviceAreas: ['Denver', 'Aurora', 'Lakewood', 'Thornton', 'Westminster']
    },
    operationalInfo: {
      status: 'active',
      workingHours: {
        monday: { open: '07:30', close: '19:00' },
        tuesday: { open: '07:30', close: '19:00' },
        wednesday: { open: '07:30', close: '19:00' },
        thursday: { open: '07:30', close: '19:00' },
        friday: { open: '07:30', close: '19:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '09:00', close: '17:00' }
      },
      servicesOffered: ['sales', 'financing', 'service_maintenance', 'parts', 'body_shop', 'tire_center']
    },
    brandPartnerships: [
      {
        manufacturer: 'General Motors',
        partnershipType: 'chevrolet_franchise',
        certifications: ['ev_certified', 'truck_specialist', 'performance_expert']
      }
    ]
  }
];

class ExternalDealerApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // In production, these would come from environment variables
    this.baseUrl = process.env.EXTERNAL_DEALER_API_URL || 'https://api.mock-dealer-system.com/v1';
    this.apiKey = process.env.EXTERNAL_DEALER_API_KEY || 'mock-api-key-12345';
  }

  /**
   * Fetch dealer information by external dealer ID
   */
  async getDealerById(externalDealerId: string): Promise<ExternalDealerInfo | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // In production, this would be an actual HTTP request
      const dealer = mockDealerDatabase.find(d => d.dealerId === externalDealerId);
      return dealer || null;
    } catch (error) {
      console.error('Error fetching dealer from external API:', error);
      return null;
    }
  }

  /**
   * Search dealers by various criteria
   */
  async searchDealers(criteria: {
    city?: string;
    state?: string;
    businessType?: string;
    manufacturer?: string;
  }): Promise<ExternalDealerInfo[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      let results = mockDealerDatabase;

      if (criteria.city) {
        results = results.filter(d =>
          d.locationInfo.city.toLowerCase().includes(criteria.city!.toLowerCase())
        );
      }

      if (criteria.state) {
        results = results.filter(d =>
          d.locationInfo.state.toLowerCase() === criteria.state!.toLowerCase()
        );
      }

      if (criteria.businessType) {
        results = results.filter(d =>
          d.businessDetails.businessType === criteria.businessType
        );
      }

      if (criteria.manufacturer) {
        results = results.filter(d =>
          d.brandPartnerships.some(p =>
            p.manufacturer.toLowerCase().includes(criteria.manufacturer!.toLowerCase())
          )
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching dealers from external API:', error);
      return [];
    }
  }

  /**
   * Get all active dealers
   */
  async getActiveDealers(): Promise<ExternalDealerInfo[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return mockDealerDatabase.filter(d => d.operationalInfo.status === 'active');
    } catch (error) {
      console.error('Error fetching active dealers from external API:', error);
      return [];
    }
  }

  /**
   * Validate if a dealer exists and is active
   */
  async validateDealer(externalDealerId: string): Promise<boolean> {
    try {
      const dealer = await this.getDealerById(externalDealerId);
      return dealer !== null && dealer.operationalInfo.status === 'active';
    } catch (error) {
      console.error('Error validating dealer:', error);
      return false;
    }
  }
}

// Export singleton instance
export const externalDealerApi = new ExternalDealerApiService();

// Helper function to convert external dealer info to internal format
export function mapExternalToInternal(externalDealer: ExternalDealerInfo) {
  return {
    externalId: externalDealer.dealerId,
    name: externalDealer.businessInfo.displayName,
    slug: externalDealer.businessInfo.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim(),
    domain: externalDealer.contactDetails.websiteUrl?.replace('https://', '').replace('http://', ''),
    subdomain: externalDealer.businessInfo.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .split('-')[0],
    status: externalDealer.operationalInfo.status.toUpperCase() as any,
    isWebsiteEnabled: true
  };
}