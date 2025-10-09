-- CreateEnum
CREATE TYPE "DealerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT,
    "status" "DealerStatus" NOT NULL DEFAULT 'ACTIVE',
    "isWebsiteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_admins" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customizations" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "branding" JSONB NOT NULL,
    "seoSettings" JSONB NOT NULL,
    "status" "PublicationStatus" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImage" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'automotive',
    "defaultSections" JSONB NOT NULL,
    "defaultBranding" JSONB NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dealers_externalId_key" ON "dealers"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_slug_key" ON "dealers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_domain_key" ON "dealers"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_subdomain_key" ON "dealers"("subdomain");

-- CreateIndex
CREATE INDEX "dealers_domain_idx" ON "dealers"("domain");

-- CreateIndex
CREATE INDEX "dealers_subdomain_idx" ON "dealers"("subdomain");

-- CreateIndex
CREATE INDEX "dealers_slug_idx" ON "dealers"("slug");

-- CreateIndex
CREATE INDEX "dealers_status_idx" ON "dealers"("status");

-- CreateIndex
CREATE INDEX "dealers_externalId_idx" ON "dealers"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_admins_dealerId_key" ON "dealer_admins"("dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_admins_email_key" ON "dealer_admins"("email");

-- CreateIndex
CREATE INDEX "dealer_admins_email_idx" ON "dealer_admins"("email");

-- CreateIndex
CREATE INDEX "dealer_admins_dealerId_idx" ON "dealer_admins"("dealerId");

-- CreateIndex
CREATE INDEX "dealer_admins_resetToken_idx" ON "dealer_admins"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_token_idx" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_idx" ON "admin_sessions"("adminId");

-- CreateIndex
CREATE INDEX "admin_sessions_expiresAt_idx" ON "admin_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "customizations_dealerId_status_idx" ON "customizations"("dealerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "customizations_dealerId_status_key" ON "customizations"("dealerId", "status");

-- CreateIndex
CREATE INDEX "templates_isAvailable_idx" ON "templates"("isAvailable");

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "templates_sortOrder_idx" ON "templates"("sortOrder");

-- AddForeignKey
ALTER TABLE "dealer_admins" ADD CONSTRAINT "dealer_admins_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "dealer_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customizations" ADD CONSTRAINT "customizations_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
