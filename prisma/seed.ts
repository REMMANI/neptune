import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash';
import { externalDealerApi } from '../src/lib/external-dealer-api';
import { seedThemes } from './seed-themes';

const prisma = new PrismaClient();

// Helper function to create slug from display name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // First seed themes
  await seedThemes();

  // Fetch active dealers from external API
  console.log('\n📡 Fetching dealer data from external API...');
  const externalDealers = await externalDealerApi.getActiveDealers();

  if (externalDealers.length === 0) {
    console.log('❌ No active dealers found');
    return;
  }

  console.log(`✅ Found ${externalDealers.length} dealers to process`);

  // Default admin password
  const adminPassword = hashPassword('admin123');

  // Get default theme
  const defaultTheme = await prisma.theme.findFirst({
    where: { isDefault: true }
  });

  if (!defaultTheme) {
    throw new Error('No default theme found');
  }

  for (const externalDealer of externalDealers) {
    const dealerSlug = createSlug(externalDealer.businessInfo.displayName);
    const subdomain = externalDealer.businessInfo.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .split('-')[0];

    console.log(`\n🏢 Processing: ${externalDealer.businessInfo.displayName}...`);

    // Create dealer site config using Prisma ORM
    const siteConfig = await prisma.dealer.upsert({
      where: {
        externalDealerId: externalDealer.dealerId
      },
      update: {
        slug: dealerSlug,
        subdomain: subdomain,
        customDomain: externalDealer.contactDetails.websiteUrl?.replace('https://', '').replace('http://', '') || null,
        lastSyncAt: new Date(),
      },
      create: {
        externalDealerId: externalDealer.dealerId,
        slug: dealerSlug,
        subdomain: subdomain,
        customDomain: externalDealer.contactDetails.websiteUrl?.replace('https://', '').replace('http://', '') || null,
        isActive: true,
        lastSyncAt: new Date(),
      }
    });

    const dealerId = siteConfig.id;

    if (!dealerId) {
      console.log(`❌ Failed to process dealer: ${externalDealer.businessInfo.displayName}`);
      continue;
    }

    // Create admin using Prisma ORM
    const adminEmail = externalDealer.contactDetails.primaryEmail;
    const adminName = `${externalDealer.businessInfo.displayName} Admin`;

    await prisma.dealerAuth.upsert({
      where: {
        email: adminEmail
      },
      update: {
        name: adminName,
        hashedPassword: adminPassword,
        isActive: true,
      },
      create: {
        dealerId: dealerId,
        email: adminEmail,
        name: adminName,
        hashedPassword: adminPassword,
        isActive: true,
      }
    });

    console.log(`✅ Created: ${externalDealer.businessInfo.displayName}`);
  }

  // Get summary using Prisma ORM
  const dealerSummary = await prisma.dealer.findMany({
    include: {
      adminAuth: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      slug: 'asc'
    }
  });

  console.log('\n🎉 Seeding completed!');
  console.log(`\n📊 Total dealer sites: ${dealerSummary.length}`);

  console.log('\n🏢 Dealer sites created:');
  for (const dealer of dealerSummary) {
    // Fetch external dealer info for display name
    const externalInfo = await externalDealerApi.getDealerById(dealer.externalDealerId);
    const displayName = externalInfo?.businessInfo.displayName || dealer.slug;

    console.log(`- ${displayName}`);
    console.log(`  Slug: ${dealer.slug}`);
    console.log(`  Subdomain: ${dealer.subdomain}.localhost:3000`);
    console.log(`  Admin: ${dealer.adminAuth?.email || 'No admin'}`);
    console.log(`  Status: ${dealer.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log('');
  }

  console.log('🔑 Default password: admin123');

  console.log('\n🌐 Test URLs:');
  for (const dealer of dealerSummary) {
    const externalInfo = await externalDealerApi.getDealerById(dealer.externalDealerId);
    const displayName = externalInfo?.businessInfo.displayName || dealer.slug;

    if (dealer.subdomain) {
      console.log(`- ${displayName}: http://${dealer.subdomain}.localhost:3000`);
    }
  }
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    console.error('Error details:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });