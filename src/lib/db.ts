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

  // Site Config operations (replaces old dealer operations)
  async findSiteConfigByDomain(domain: string) {
    await this.ensureConnection();

    const subdomain = domain.split('.')[0];
    const result = await prisma.$queryRaw`
      SELECT id, "externalDealerId", slug, subdomain, "customDomain", "isActive"
      FROM dealer_site_configs
      WHERE ("customDomain" = ${domain} OR subdomain = ${subdomain})
        AND "isActive" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findSiteConfigById(id: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, "externalDealerId", slug, subdomain, "customDomain", "isActive"
      FROM dealer_site_configs
      WHERE id = ${id}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findSiteConfigBySlug(slug: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, "externalDealerId", slug, subdomain, "customDomain", "isActive"
      FROM dealer_site_configs
      WHERE slug = ${slug}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async findSiteConfigByExternalId(externalId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT id, "externalDealerId", slug, subdomain, "customDomain", "isActive"
      FROM dealer_site_configs
      WHERE "externalDealerId" = ${externalId}
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  // Site Customization operations (updated for new schema)
  async getSiteCustomization(siteConfigId: string, status: 'DRAFT' | 'PUBLISHED') {
    await this.ensureConnection();

    try {
      // Use direct string interpolation to avoid enum casting issues
      const query = status === 'DRAFT' ?
        prisma.$queryRaw`
          SELECT sc.*, t.key as theme_key, t.name as theme_name
          FROM site_customizations sc
          LEFT JOIN themes t ON sc."themeId" = t.id
          WHERE sc."siteConfigId" = ${siteConfigId} AND sc.status = 'DRAFT'
          LIMIT 1
        ` :
        prisma.$queryRaw`
          SELECT sc.*, t.key as theme_key, t.name as theme_name
          FROM site_customizations sc
          LEFT JOIN themes t ON sc."themeId" = t.id
          WHERE sc."siteConfigId" = ${siteConfigId} AND sc.status = 'PUBLISHED'
          LIMIT 1
        `;

      const result = await query as any[];
      return result[0] || null;
    } catch (error) {
      console.warn(`Error getting site customization: ${error}`);
      return null;
    }
  }

  async upsertDraftSiteCustomization(siteConfigId: string, themeId: string, data: any) {
    await this.ensureConnection();

    // Convert data to new schema format
    const customColors = data.customColors ? JSON.stringify(data.customColors) : null;
    const customTypography = data.customTypography ? JSON.stringify(data.customTypography) : null;
    const customSpacing = data.customSpacing ? JSON.stringify(data.customSpacing) : null;
    const customComponents = data.customComponents ? JSON.stringify(data.customComponents) : null;
    const sections = JSON.stringify(data.sections || {});
    const content = JSON.stringify(data.content || {});
    const navigation = JSON.stringify(data.navigation || {});
    const seoSettings = JSON.stringify(data.seoSettings || {});
    const builderState = data.builderState ? JSON.stringify(data.builderState) : null;

    return await prisma.$executeRaw`
      INSERT INTO site_customizations (
        id, "siteConfigId", "themeId", "customColors", "customTypography", "customSpacing",
        "customComponents", sections, content, navigation, "seoSettings", status, "builderState", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${siteConfigId}, ${themeId}, ${customColors}::jsonb, ${customTypography}::jsonb,
        ${customSpacing}::jsonb, ${customComponents}::jsonb, ${sections}::jsonb, ${content}::jsonb,
        ${navigation}::jsonb, ${seoSettings}::jsonb, 'DRAFT', ${builderState}::jsonb, NOW(), NOW()
      )
      ON CONFLICT ("siteConfigId", status) DO UPDATE SET
        "themeId" = EXCLUDED."themeId",
        "customColors" = EXCLUDED."customColors",
        "customTypography" = EXCLUDED."customTypography",
        "customSpacing" = EXCLUDED."customSpacing",
        "customComponents" = EXCLUDED."customComponents",
        sections = EXCLUDED.sections,
        content = EXCLUDED.content,
        navigation = EXCLUDED.navigation,
        "seoSettings" = EXCLUDED."seoSettings",
        "builderState" = EXCLUDED."builderState",
        "updatedAt" = NOW()
    `;
  }

  async publishDraftSiteCustomization(siteConfigId: string, publishedBy: string) {
    await this.ensureConnection();

    return await prisma.$transaction(async (tx) => {
      // Get current draft
      const draft = await tx.$queryRaw`
        SELECT * FROM site_customizations
        WHERE "siteConfigId" = ${siteConfigId} AND status = 'DRAFT'
        LIMIT 1
      ` as any[];

      if (!draft[0]) {
        throw new Error('No draft customization found');
      }

      const draftData = draft[0];

      // Archive existing published version
      await tx.$executeRaw`
        UPDATE site_customizations
        SET status = 'ARCHIVED', "updatedAt" = NOW()
        WHERE "siteConfigId" = ${siteConfigId} AND status = 'PUBLISHED'
      `;

      // Create new published version from draft
      await tx.$executeRaw`
        INSERT INTO site_customizations (
          id, "siteConfigId", "themeId", "customColors", "customTypography", "customSpacing",
          "customComponents", sections, content, navigation, "seoSettings", status,
          "publishedAt", "publishedBy", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${siteConfigId}, ${draftData.themeId}, ${draftData.customColors}::jsonb,
          ${draftData.customTypography}::jsonb, ${draftData.customSpacing}::jsonb, ${draftData.customComponents}::jsonb,
          ${draftData.sections}::jsonb, ${draftData.content}::jsonb, ${draftData.navigation}::jsonb,
          ${draftData.seoSettings}::jsonb, 'PUBLISHED', NOW(), ${publishedBy}, NOW(), NOW()
        )
      `;

      // Delete the draft
      await tx.$executeRaw`
        DELETE FROM site_customizations WHERE id = ${draftData.id}
      `;

      return { success: true };
    });
  }

  // Theme operations (replaces template operations)
  async getAvailableThemes() {
    await this.ensureConnection();

    return await prisma.$queryRaw`
      SELECT * FROM themes
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    ` as any[];
  }

  async getThemeById(themeId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM themes
      WHERE id = ${themeId} AND "isActive" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async getThemeByKey(themeKey: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM themes
      WHERE key = ${themeKey} AND "isActive" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  async getDefaultTheme() {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM themes
      WHERE "isDefault" = true AND "isActive" = true
      LIMIT 1
    ` as any[];
    return result[0] || null;
  }

  // Dealer Admin operations (updated for new schema)
  async findDealerAdminByEmail(email: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT
        da.*,
        dsc.id as "site_config_id", dsc."externalDealerId", dsc.slug, dsc.subdomain, dsc."isActive" as "site_active"
      FROM dealer_admins da
      LEFT JOIN dealer_site_configs dsc ON da."siteConfigId" = dsc.id
      WHERE da.email = ${email} AND da."isActive" = true
      LIMIT 1
    ` as any[];

    if (result[0]) {
      const admin = result[0];
      return {
        ...admin,
        siteConfig: {
          id: admin.site_config_id,
          externalDealerId: admin.externalDealerId,
          slug: admin.slug,
          subdomain: admin.subdomain,
          isActive: admin.site_active,
        },
      };
    }
    return null;
  }

  async findDealerAdminBySiteConfig(siteConfigId: string) {
    await this.ensureConnection();

    const result = await prisma.$queryRaw`
      SELECT * FROM dealer_admins
      WHERE "siteConfigId" = ${siteConfigId} AND "isActive" = true
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
        da.id as "admin_id", da.email as "admin_email", da.name as "admin_name", da."siteConfigId" as "admin_siteConfigId", da."isActive" as "admin_isActive",
        dsc.id as "site_config_id", dsc."externalDealerId", dsc.slug as "site_slug", dsc.subdomain, dsc."isActive" as "site_active"
      FROM admin_sessions s
      LEFT JOIN dealer_admins da ON s."adminId" = da.id
      LEFT JOIN dealer_site_configs dsc ON da."siteConfigId" = dsc.id
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
          siteConfigId: session.admin_siteConfigId,
          isActive: session.admin_isActive,
          siteConfig: {
            id: session.site_config_id,
            externalDealerId: session.externalDealerId,
            slug: session.site_slug,
            subdomain: session.subdomain,
            isActive: session.site_active,
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

// Convenience functions for site config operations
export const findSiteConfigByDomain = (domain: string) => db.findSiteConfigByDomain(domain);
export const findSiteConfigById = (id: string) => db.findSiteConfigById(id);
export const findSiteConfigBySlug = (slug: string) => db.findSiteConfigBySlug(slug);
export const findSiteConfigByExternalId = (externalId: string) => db.findSiteConfigByExternalId(externalId);

// Convenience functions for site customization
export const getSiteCustomization = (siteConfigId: string, status: 'DRAFT' | 'PUBLISHED') =>
  db.getSiteCustomization(siteConfigId, status);
export const upsertDraftSiteCustomization = (siteConfigId: string, themeId: string, data: any) =>
  db.upsertDraftSiteCustomization(siteConfigId, themeId, data);
export const publishDraftSiteCustomization = (siteConfigId: string, publishedBy: string) =>
  db.publishDraftSiteCustomization(siteConfigId, publishedBy);

// Convenience functions for themes
export const getAvailableThemes = () => db.getAvailableThemes();
export const getThemeById = (themeId: string) => db.getThemeById(themeId);
export const getThemeByKey = (themeKey: string) => db.getThemeByKey(themeKey);
export const getDefaultTheme = () => db.getDefaultTheme();

// Convenience functions for dealer admin
export const findDealerAdminByEmail = (email: string) => db.findDealerAdminByEmail(email);
export const findDealerAdminBySiteConfig = (siteConfigId: string) => db.findDealerAdminBySiteConfig(siteConfigId);
export const updateAdminLastLogin = (adminId: string) => db.updateAdminLastLogin(adminId);
export const createAdminSession = (adminId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string) =>
  db.createAdminSession(adminId, token, expiresAt, ipAddress, userAgent);
export const findValidSession = (token: string) => db.findValidSession(token);
export const deleteExpiredSessions = () => db.deleteExpiredSessions();

// Backwards compatibility - these functions now work with external dealer API
export const findDealerByDomain = findSiteConfigByDomain;
export const findDealerById = findSiteConfigById;
export const findDealerBySlug = findSiteConfigBySlug;
export const findDealerByExternalId = findSiteConfigByExternalId;
export const getCustomization = getSiteCustomization;
export const upsertDraftCustomization = upsertDraftSiteCustomization;
export const publishDraftCustomization = publishDraftSiteCustomization;

// Health check endpoint
export const healthCheck = () => db.healthCheck();