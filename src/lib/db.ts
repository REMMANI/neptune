import { prisma, connectPrisma, checkDatabaseHealth } from './prisma';
import type { DealerConfig } from '@/types/customization';

// Re-export the prisma instance
export { prisma } from './prisma';

// Database utilities
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Ensure connection before operations
  async ensureConnection() {
    return await connectPrisma();
  }

  // Health check
  async healthCheck() {
    return await checkDatabaseHealth();
  }

  // Dealer operations
  async findDealerByDomain(domain: string) {
    await this.ensureConnection();

    return await prisma.dealer.findFirst({
      where: {
        OR: [
          { domain: domain },
          { subdomain: domain.split('.')[0] },
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        status: true,
      },
    });
  }

  async findDealerById(id: string) {
    await this.ensureConnection();

    return await prisma.dealer.findUnique({
      where: {
        id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        status: true,
        name: true,
      },
    });
  }

  async findDealerBySlug(slug: string) {
    await this.ensureConnection();

    return await prisma.dealer.findUnique({
      where: {
        slug,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        status: true,
        name: true,
      },
    });
  }

  // Customization operations
  async getDealerCustomization(dealerId: string, status: 'DRAFT' | 'PUBLISHED') {
    await this.ensureConnection();

    try {
      return await prisma.dealerCustomization.findUnique({
        where: {
          dealerId_status: {
            dealerId,
            status,
          },
        },
      });
    } catch (error) {
      // Handle schema mismatch gracefully - return null if table/columns don't exist
      if (error instanceof Error && error.message.includes('does not exist in the current database')) {
        console.warn(`Database schema mismatch for dealerCustomization: ${error.message}`);
        return null;
      }
      throw error;
    }
  }

  async upsertDraftCustomization(dealerId: string, data: Partial<DealerConfig>) {
    await this.ensureConnection();

    // Convert DealerConfig to new schema format
    const sections = JSON.stringify(data.sections || {});
    const settings = JSON.stringify({
      theme: data.theme || {},
      ...data
    });

    return await prisma.dealerCustomization.upsert({
      where: {
        dealerId_status: {
          dealerId,
          status: 'DRAFT',
        },
      },
      update: {
        sections: sections,
        settings: settings,
        updatedAt: new Date(),
      },
      create: {
        dealerId,
        templateId: 'default-template',
        sections: sections,
        settings: settings,
        status: 'DRAFT',
      },
    });
  }

  async publishDraftCustomization(dealerId: string) {
    await this.ensureConnection();

    return await prisma.$transaction(async (tx) => {
      // Get current draft
      const draft = await tx.dealerCustomization.findUnique({
        where: {
          dealerId_status: {
            dealerId,
            status: 'DRAFT',
          },
        },
      });

      if (!draft) {
        throw new Error('No draft customization found');
      }

      // Delete existing published version
      await tx.dealerCustomization.deleteMany({
        where: {
          dealerId,
          status: 'PUBLISHED',
        },
      });

      // Create new published version
      const published = await tx.dealerCustomization.create({
        data: {
          dealerId,
          templateId: draft.templateId,
          sections: draft.sections,
          settings: draft.settings,
          status: 'PUBLISHED',
        },
      });

      // Delete the draft
      await tx.dealerCustomization.delete({
        where: { id: draft.id },
      });

      return published;
    });
  }

  // Generic query methods
  async findMany<T>(model: string, args?: any): Promise<T[]> {
    await this.ensureConnection();

    const modelAccess = (prisma as any)[model];
    if (!modelAccess) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelAccess.findMany(args);
  }

  async findUnique<T>(model: string, args: any): Promise<T | null> {
    await this.ensureConnection();

    const modelAccess = (prisma as any)[model];
    if (!modelAccess) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelAccess.findUnique(args);
  }

  async create<T>(model: string, args: any): Promise<T> {
    await this.ensureConnection();

    const modelAccess = (prisma as any)[model];
    if (!modelAccess) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelAccess.create(args);
  }

  async update<T>(model: string, args: any): Promise<T> {
    await this.ensureConnection();

    const modelAccess = (prisma as any)[model];
    if (!modelAccess) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelAccess.update(args);
  }

  async delete<T>(model: string, args: any): Promise<T> {
    await this.ensureConnection();

    const modelAccess = (prisma as any)[model];
    if (!modelAccess) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelAccess.delete(args);
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Convenience functions
export const findDealerByDomain = (domain: string) => db.findDealerByDomain(domain);
export const findDealerById = (id: string) => db.findDealerById(id);
export const findDealerBySlug = (slug: string) => db.findDealerBySlug(slug);
export const getDealerCustomization = (dealerId: string, status: 'DRAFT' | 'PUBLISHED') =>
  db.getDealerCustomization(dealerId, status);
export const upsertDraftCustomization = (dealerId: string, data: Partial<DealerConfig>) =>
  db.upsertDraftCustomization(dealerId, data);
export const publishDraftCustomization = (dealerId: string) => db.publishDraftCustomization(dealerId);

// Health check endpoint
export const healthCheck = () => db.healthCheck();