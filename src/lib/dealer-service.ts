import 'server-only';
import { externalDealerApi, type ExternalDealerInfo } from './external-dealer-api';

// This service handles dealer data from external API (no local storage)
// Only site configurations and customizations are stored locally

export interface DealerInfo extends ExternalDealerInfo {
  // Computed fields for UI
  displayName: string;
  fullAddress: string;
  isActive: boolean;
}

export class DealerService {

  /**
   * Get dealer information by external dealer ID
   * This always fetches fresh data from external API
   */
  async getDealerById(externalDealerId: string): Promise<DealerInfo | null> {
    const externalDealer = await externalDealerApi.getDealerById(externalDealerId);

    if (!externalDealer) {
      return null;
    }

    return this.enrichDealerInfo(externalDealer);
  }

  /**
   * Get dealer information by site slug
   * First looks up the site config, then fetches dealer data
   */
  async getDealerBySlug(slug: string): Promise<DealerInfo | null> {
    try {
      // Try to use database lookup when Prisma client is working
      // const { findSiteConfigBySlug } = await import('./db');
      // const siteConfig = await findSiteConfigBySlug(slug);
      // if (siteConfig) {
      //   return this.getDealerById(siteConfig.externalDealerId);
      // }

      // Fallback: try to map common slugs to external dealer IDs
      const slugToExternalIdMap: Record<string, string> = {
        'premium-motors': 'PMV-2024-001',
        'sunshine-ford': 'SFD-2024-002',
        'mountain-view-chevrolet': 'MVC-2024-003',
        'premium': 'PMV-2024-001',
        'sunshine': 'SFD-2024-002',
        'mountain': 'MVC-2024-003',
      };

      const externalId = slugToExternalIdMap[slug];
      if (externalId) {
        return this.getDealerById(externalId);
      }

      return null;
    } catch (error) {
      console.error('Error looking up dealer by slug:', error);
      return null;
    }
  }

  /**
   * Search dealers using external API
   */
  async searchDealers(criteria: {
    city?: string;
    state?: string;
    businessType?: string;
    manufacturer?: string;
  }): Promise<DealerInfo[]> {
    const externalDealers = await externalDealerApi.searchDealers(criteria);
    return externalDealers.map(dealer => this.enrichDealerInfo(dealer));
  }

  /**
   * Get all active dealers
   */
  async getActiveDealers(): Promise<DealerInfo[]> {
    const externalDealers = await externalDealerApi.getActiveDealers();
    return externalDealers.map(dealer => this.enrichDealerInfo(dealer));
  }

  /**
   * Validate if a dealer exists and is active
   */
  async validateDealer(externalDealerId: string): Promise<boolean> {
    return externalDealerApi.validateDealer(externalDealerId);
  }

  /**
   * Check if dealer data has changed (for sync purposes)
   */
  async checkDealerSync(externalDealerId: string, lastSyncAt?: Date): Promise<{
    hasChanged: boolean;
    dealer?: DealerInfo;
  }> {
    const dealer = await this.getDealerById(externalDealerId);

    if (!dealer) {
      return { hasChanged: false };
    }

    // Simple check - if no last sync date, consider it changed
    // In production, you might compare timestamps or use API versioning
    const hasChanged = !lastSyncAt || (Date.now() - lastSyncAt.getTime()) > 24 * 60 * 60 * 1000; // 24 hours

    return {
      hasChanged,
      dealer: hasChanged ? dealer : undefined
    };
  }

  /**
   * Enrich external dealer info with computed fields
   */
  private enrichDealerInfo(externalDealer: ExternalDealerInfo): DealerInfo {
    const location = externalDealer.locationInfo;

    return {
      ...externalDealer,
      displayName: externalDealer.businessInfo.displayName,
      fullAddress: `${location.streetAddress}, ${location.city}, ${location.state} ${location.zipCode}`,
      isActive: externalDealer.operationalInfo.status === 'active'
    };
  }
}

// Export singleton instance
export const dealerService = new DealerService();