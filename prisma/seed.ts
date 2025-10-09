import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash';
import { externalDealerApi, mapExternalToInternal } from '../src/lib/external-dealer-api';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting dealer database seeding...');

  // Fetch active dealers from external API
  console.log('📡 Fetching dealer data from external API...');
  const externalDealers = await externalDealerApi.getActiveDealers();

  if (externalDealers.length === 0) {
    console.log('❌ No active dealers found');
    return;
  }

  console.log(`✅ Found ${externalDealers.length} dealers to process`);

  // Default admin password
  const adminPassword = hashPassword('admin123');

  for (const externalDealer of externalDealers) {
    const dealerData = mapExternalToInternal(externalDealer);

    console.log(`\n🏢 Processing: ${externalDealer.businessInfo.displayName}...`);

    // Create dealer and admin in transaction
    const dealerId = await prisma.$transaction(async (tx) => {
      // Insert dealer
      await tx.$executeRaw`
        INSERT INTO dealers (
          id,
          "externalId",
          "name",
          "slug",
          "domain",
          "subdomain",
          "status",
          "isWebsiteEnabled",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${dealerData.externalId},
          ${dealerData.name},
          ${dealerData.slug},
          ${dealerData.domain},
          ${dealerData.subdomain},
          ${dealerData.status}::"DealerStatus",
          ${dealerData.isWebsiteEnabled},
          NOW(),
          NOW()
        )
        ON CONFLICT ("externalId") DO UPDATE SET
          "name" = EXCLUDED."name",
          "slug" = EXCLUDED."slug",
          "domain" = EXCLUDED."domain",
          "subdomain" = EXCLUDED."subdomain",
          "status" = EXCLUDED."status",
          "isWebsiteEnabled" = EXCLUDED."isWebsiteEnabled",
          "updatedAt" = NOW()
      `;

      // Get dealer ID
      const result = await tx.$queryRaw`
        SELECT id FROM dealers
        WHERE "externalId" = ${dealerData.externalId}
        LIMIT 1
      ` as any[];

      return result[0]?.id;
    });

    if (!dealerId) {
      console.log(`❌ Failed to process dealer: ${externalDealer.businessInfo.displayName}`);
      continue;
    }

    // Create admin
    const adminEmail = externalDealer.contactDetails.primaryEmail;
    const adminName = `${externalDealer.businessInfo.displayName} Admin`;

    await prisma.$executeRaw`
      INSERT INTO dealer_admins (
        id,
        "dealerId",
        "email",
        "name",
        "hashedPassword",
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${dealerId},
        ${adminEmail},
        ${adminName},
        ${adminPassword},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE SET
        "name" = EXCLUDED."name",
        "hashedPassword" = EXCLUDED."hashedPassword",
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
    `;

    console.log(`✅ Created: ${externalDealer.businessInfo.displayName}`);
  }

  // Get summary
  const dealerSummary = await prisma.$queryRaw`
    SELECT
      d."name",
      d."slug",
      d."subdomain",
      d."status",
      da."email"
    FROM dealers d
    LEFT JOIN dealer_admins da ON d.id = da."dealerId"
    ORDER BY d."name"
  ` as any[];

  console.log('\n🎉 Seeding completed!');
  console.log(`\n📊 Total dealers: ${dealerSummary.length}`);

  console.log('\n🏢 Dealers created:');
  dealerSummary.forEach((dealer: any) => {
    console.log(`- ${dealer.name}`);
    console.log(`  Slug: ${dealer.slug}`);
    console.log(`  Subdomain: ${dealer.subdomain}.localhost:3000`);
    console.log(`  Admin: ${dealer.email}`);
    console.log(`  Status: ${dealer.status}`);
    console.log('');
  });

  console.log('🔑 Default password: admin123');

  console.log('\n🌐 Test URLs:');
  dealerSummary.forEach((dealer: any) => {
    if (dealer.subdomain) {
      console.log(`- ${dealer.name}: http://${dealer.subdomain}.localhost:3000`);
    }
  });
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