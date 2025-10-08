import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create dealers
  const premiumMotors = await prisma.dealer.upsert({
    where: { slug: 'premium-motors' },
    update: {},
    create: {
      name: 'Premium Motors',
      slug: 'premium-motors',
      domain: 'premium-motors.com',
      subdomain: 'premium',
      themeKey: 'base',
      status: 'ACTIVE',
    },
  });

  const classicAuto = await prisma.dealer.upsert({
    where: { slug: 'classic-auto' },
    update: {},
    create: {
      name: 'Classic Auto Sales',
      slug: 'classic-auto',
      domain: 'classic-auto.com',
      subdomain: 'classic',
      themeKey: 't1',
      status: 'ACTIVE',
    },
  });

  // Create admin users
  console.log('Creating admin users...');

  // Hash passwords before storing
  const hashedPassword = hashPassword('admin123');

  console.log('Creating admin users with hashed passwords...');

  // Note: Using $executeRaw to directly insert into database to bypass client issues
  await prisma.$executeRaw`
    INSERT INTO admin_users (id, email, name, password, role, permissions, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@example.com', 'Super Admin', ${hashedPassword}, 'SUPER_ADMIN', '["*"]', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  const superAdmin = await prisma.$queryRaw`
    SELECT id, email, name FROM admin_users WHERE email = 'admin@example.com'
  ` as any[];

  await prisma.$executeRaw`
    INSERT INTO admin_users (id, email, name, password, role, "dealerId", permissions, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'dealer@premium-motors.com', 'Premium Motors Admin', ${hashedPassword}, 'DEALER_ADMIN', ${premiumMotors.id}, '["customize", "preview", "publish"]', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  const dealerAdmin = await prisma.$queryRaw`
    SELECT id, email, name FROM admin_users WHERE email = 'dealer@premium-motors.com'
  ` as any[];

  await prisma.$executeRaw`
    INSERT INTO admin_users (id, email, name, password, role, "dealerId", permissions, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@classic-auto.com', 'Classic Auto Admin', ${hashedPassword}, 'DEALER_ADMIN', ${classicAuto.id}, '["customize", "preview", "publish"]', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  const classicAdmin = await prisma.$queryRaw`
    SELECT id, email, name FROM admin_users WHERE email = 'admin@classic-auto.com'
  ` as any[];

  console.log('✅ Database seeded successfully!');
  console.log('\n🔑 Admin Credentials:');
  console.log('Super Admin: admin@example.com / admin123');
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