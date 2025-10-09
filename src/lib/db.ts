import { prisma, connectPrisma, checkDatabaseHealth } from './prisma';

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

    const result = await prisma.$queryRaw`
      SELECT id, slug, status, name, subdomain
      FROM dealers
      WHERE (domain = ${domain} OR subdomain = ${domain.split('.')[0]})
        AND status = 'ACTIVE'
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findDealerById(id: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, slug, status, name, subdomain
      FROM dealers
      WHERE id = ${id}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findDealerBySlug(slug: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, slug, status, name, subdomain
      FROM dealers
      WHERE slug = ${slug}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findDealerByExternalId(externalId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, slug, status, name, subdomain, "externalId"
      FROM dealers
      WHERE "externalId" = ${externalId}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  // Customization operations
  async getCustomization(dealerId: string, status: 'DRAFT' | 'PUBLISHED') {
    await this.ensureConnection();

    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM customizations
        WHERE "dealerId" = ${dealerId} AND status = ${status}
        LIMIT 1
      ` as any[];
      return result[0] || null;
    } catch (error) {
      console.warn(`Error getting customization: ${error}`);
      return null;
    }
  }

  async upsertDraftCustomization(dealerId: string, data: any) {
    await this.ensureConnection();

    // Convert data to new schema format
    const sections = JSON.stringify(data.sections || {});
    const branding = JSON.stringify(data.branding || data.theme || {});
    const seoSettings = JSON.stringify(data.seo || {});

    return await prisma.$executeRaw`
      INSERT INTO customizations (
        id, "dealerId", "templateId", sections, branding, "seoSettings", status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${dealerId}, ${data.templateId || 'default-template'}, ${sections}::jsonb,
        ${branding}::jsonb, ${seoSettings}::jsonb, 'DRAFT'::"PublicationStatus", NOW(), NOW()
      )
      ON CONFLICT ("dealerId", status) DO UPDATE SET
        "templateId" = EXCLUDED."templateId",
        sections = EXCLUDED.sections,
        branding = EXCLUDED.branding,
        "seoSettings" = EXCLUDED."seoSettings",
        "updatedAt" = NOW()
    `;
  }

  async publishDraftCustomization(dealerId: string) {
    await this.ensureConnection();

    return await prisma.$transaction(async (tx) => {
      // Get current draft
      const draft = await tx.$queryRaw`
        SELECT * FROM customizations
        WHERE "dealerId" = ${dealerId} AND status = 'DRAFT'
        LIMIT 1
      ` as any[];

      if (!draft[0]) {
        throw new Error('No draft customization found');
      }

      const draftData = draft[0];

      // Delete existing published version
      await tx.$executeRaw`
        DELETE FROM customizations
        WHERE "dealerId" = ${dealerId} AND status = 'PUBLISHED'
      `;

      // Create new published version
      await tx.$executeRaw`
        INSERT INTO customizations (
          id, "dealerId", "templateId", sections, branding, "seoSettings", status, "publishedAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${dealerId}, ${draftData.templateId}, ${draftData.sections}::jsonb,
          ${draftData.branding}::jsonb, ${draftData.seoSettings}::jsonb, 'PUBLISHED'::"PublicationStatus", NOW(), NOW(), NOW()
        )
      `;

      // Delete the draft
      await tx.$executeRaw`
        DELETE FROM customizations WHERE id = ${draftData.id}
      `;

      return { success: true };
    });
  }

  // Template operations
  async getAvailableTemplates() {
    await this.ensureConnection();

    return await prisma.$queryRaw`
      SELECT * FROM templates
      WHERE "isAvailable" = true
      ORDER BY "sortOrder" ASC
    ` as any[];
  }

  async getTemplateById(templateId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM templates
      WHERE id = ${templateId} AND "isAvailable" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  // Dealer Admin operations
  async findDealerAdminByEmail(email: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT
        da.*,
        d.id as "dealer_id", d.name as "dealer_name", d.slug as "dealer_slug", d.status as "dealer_status"
      FROM dealer_admins da
      LEFT JOIN dealers d ON da."dealerId" = d.id
      WHERE da.email = ${email} AND da."isActive" = true
      LIMIT 1
    ` as any[];

    if (result[0]) {
      const admin = result[0];
      return {
        ...admin,
        dealer: {
          id: admin.dealer_id,
          name: admin.dealer_name,
          slug: admin.dealer_slug,
          status: admin.dealer_status,
        },
      };
    }
    return null;
  }

  async findDealerAdminByDealer(dealerId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM dealer_admins
      WHERE "dealerId" = ${dealerId} AND "isActive" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async updateAdminLastLogin(adminId: string) {
    await this.ensureConnection();

    return await prisma.$executeRaw`
      UPDATE dealer_admins
      SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${adminId}
    `;
  }

  async createAdminSession(adminId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string) {
    await this.ensureConnection();

    return await prisma.$executeRaw`
      INSERT INTO admin_sessions (id, "adminId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${adminId}, ${token}, ${expiresAt}, ${ipAddress}, ${userAgent}, NOW(), NOW())
    `;
  }

  async findValidSession(token: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT
        s.*,
        da.id as "admin_id", da.email as "admin_email", da.name as "admin_name", da."dealerId" as "admin_dealerId", da."isActive" as "admin_isActive",
        d.id as "dealer_id", d.name as "dealer_name", d.slug as "dealer_slug", d.status as "dealer_status"
      FROM admin_sessions s
      LEFT JOIN dealer_admins da ON s."adminId" = da.id
      LEFT JOIN dealers d ON da."dealerId" = d.id
      WHERE s.token = ${token} AND s."expiresAt" > NOW()
      LIMIT 1
    ` as any[];

    if (result[0]) {
      const session = result[0];
      return {
        ...session,
        admin: {
          id: session.admin_id,
          email: session.admin_email,
          name: session.admin_name,
          dealerId: session.admin_dealerId,
          isActive: session.admin_isActive,
          dealer: {
            id: session.dealer_id,
            name: session.dealer_name,
            slug: session.dealer_slug,
            status: session.dealer_status,
          },
        },
      };
    }
    return null;
  }

  async deleteExpiredSessions() {
    await this.ensureConnection();

    return await prisma.$executeRaw`
      DELETE FROM admin_sessions
      WHERE "expiresAt" < NOW()
    `;
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

// Convenience functions for dealer operations
export const findDealerByDomain = (domain: string) => db.findDealerByDomain(domain);
export const findDealerById = (id: string) => db.findDealerById(id);
export const findDealerBySlug = (slug: string) => db.findDealerBySlug(slug);
export const findDealerByExternalId = (externalId: string) => db.findDealerByExternalId(externalId);

// Convenience functions for customization
export const getCustomization = (dealerId: string, status: 'DRAFT' | 'PUBLISHED') =>
  db.getCustomization(dealerId, status);
export const upsertDraftCustomization = (dealerId: string, data: any) =>
  db.upsertDraftCustomization(dealerId, data);
export const publishDraftCustomization = (dealerId: string) => db.publishDraftCustomization(dealerId);

// Convenience functions for templates
export const getAvailableTemplates = () => db.getAvailableTemplates();
export const getTemplateById = (templateId: string) => db.getTemplateById(templateId);

// Convenience functions for dealer admin
export const findDealerAdminByEmail = (email: string) => db.findDealerAdminByEmail(email);
export const findDealerAdminByDealer = (dealerId: string) => db.findDealerAdminByDealer(dealerId);
export const updateAdminLastLogin = (adminId: string) => db.updateAdminLastLogin(adminId);
export const createAdminSession = (adminId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string) =>
  db.createAdminSession(adminId, token, expiresAt, ipAddress, userAgent);
export const findValidSession = (token: string) => db.findValidSession(token);
export const deleteExpiredSessions = () => db.deleteExpiredSessions();

// Health check endpoint
export const healthCheck = () => db.healthCheck();