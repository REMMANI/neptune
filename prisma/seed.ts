import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords before storing
  const hashedPassword = hashPassword('admin123');

  console.log('Creating dealers and admins with raw SQL...');

  // Create dealers using raw SQL
  await prisma.$executeRaw`
    INSERT INTO dealers (id, name, slug, domain, subdomain, status, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Premium Motors', 'premium-motors', 'premium-motors.com', 'premium', 'ACTIVE', NOW(), NOW())
    ON CONFLICT (slug) DO NOTHING
  `;

  await prisma.$executeRaw`
    INSERT INTO dealers (id, name, slug, domain, subdomain, status, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Classic Auto Sales', 'classic-auto', 'classic-auto.com', 'classic', 'ACTIVE', NOW(), NOW())
    ON CONFLICT (slug) DO NOTHING
  `;

  // Get dealer IDs
  const dealers = await prisma.$queryRaw`
    SELECT id, name, slug FROM dealers WHERE slug IN ('premium-motors', 'classic-auto')
  ` as any[];

  const premiumMotors = dealers.find((d: any) => d.slug === 'premium-motors');
  const classicAuto = dealers.find((d: any) => d.slug === 'classic-auto');

  // Create dealer admins using raw SQL
  await prisma.$executeRaw`
    INSERT INTO dealer_admins (id, email, name, password, "dealerId", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'dealer@premium-motors.com', 'Premium Motors Admin', ${hashedPassword}, ${premiumMotors.id}, true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  await prisma.$executeRaw`
    INSERT INTO dealer_admins (id, email, name, password, "dealerId", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@classic-auto.com', 'Classic Auto Admin', ${hashedPassword}, ${classicAuto.id}, true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('✅ Database seeded successfully!');
  console.log('\n🔑 Admin Credentials:');
  console.log('Premium Motors Admin: dealer@premium-motors.com / admin123');
  console.log('Classic Auto Admin: admin@classic-auto.com / admin123');
  console.log('\n🏢 Dealers created:');
  console.log(`- ${premiumMotors.name} (${premiumMotors.slug})`);
  console.log(`- ${classicAuto.name} (${classicAuto.slug})`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });