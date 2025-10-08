-- CreateEnum
CREATE TYPE "DealerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CustomizationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT,
    "themeKey" TEXT NOT NULL DEFAULT 'base',
    "status" "DealerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_customizations" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "CustomizationStatus" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_customizations_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "dealer_customizations_dealerId_status_idx" ON "dealer_customizations"("dealerId", "status");

-- CreateIndex
CREATE INDEX "dealer_customizations_dealerId_version_idx" ON "dealer_customizations"("dealerId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_customizations_dealerId_status_key" ON "dealer_customizations"("dealerId", "status");

-- AddForeignKey
ALTER TABLE "dealer_customizations" ADD CONSTRAINT "dealer_customizations_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;