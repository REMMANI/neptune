import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCustomization = {
  theme: {
    key: 'base',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '4rem',
    },
  },
  sections: {
    showHero: true,
    showFeatures: true,
    showFooter: true,
    showInventoryLink: true,
    showTestimonials: false,
    showGallery: false,
    showContactForm: true,
  },
  menu: [
    {
      id: '1',
      label: 'Home',
      slug: '',
      href: null,
      order: 0,
      children: [],
    },
    {
      id: '2',
      label: 'Inventory',
      slug: 'inventory',
      href: null,
      order: 1,
      children: [],
    },
    {
      id: '3',
      label: 'About',
      slug: 'about',
      href: null,
      order: 2,
      children: [],
    },
    {
      id: '4',
      label: 'Contact',
      slug: 'contact',
      href: null,
      order: 3,
      children: [],
    },
  ],
  tokens: {
    borderRadius: '8px',
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
};

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo dealers
  const dealer1 = await prisma.dealer.upsert({
    where: { slug: 'premium-motors' },
    update: {},
    create: {
      name: 'Premium Motors',
      slug: 'premium-motors',
      domain: 'premium.example.com',
      subdomain: 'premium',
      themeKey: 't1',
      status: 'ACTIVE',
    },
  });

  const dealer2 = await prisma.dealer.upsert({
    where: { slug: 'classic-auto' },
    update: {},
    create: {
      name: 'Classic Auto',
      slug: 'classic-auto',
      domain: 'classic.example.com',
      subdomain: 'classic',
      themeKey: 'base',
      status: 'ACTIVE',
    },
  });

  // Create published customizations
  await prisma.dealerCustomization.upsert({
    where: {
      dealerId_status: {
        dealerId: dealer1.id,
        status: 'PUBLISHED',
      },
    },
    update: {},
    create: {
      dealerId: dealer1.id,
      status: 'PUBLISHED',
      version: 1,
      data: {
        ...defaultCustomization,
        theme: {
          ...defaultCustomization.theme,
          key: 't1',
          colors: {
            primary: '#dc2626',
            secondary: '#64748b',
            accent: '#f59e0b',
          },
        },
        sections: {
          ...defaultCustomization.sections,
          showTestimonials: true,
        },
      },
    },
  });

  await prisma.dealerCustomization.upsert({
    where: {
      dealerId_status: {
        dealerId: dealer2.id,
        status: 'PUBLISHED',
      },
    },
    update: {},
    create: {
      dealerId: dealer2.id,
      status: 'PUBLISHED',
      version: 1,
      data: defaultCustomization,
    },
  });

  // Create draft customizations
  await prisma.dealerCustomization.upsert({
    where: {
      dealerId_status: {
        dealerId: dealer1.id,
        status: 'DRAFT',
      },
    },
    update: {},
    create: {
      dealerId: dealer1.id,
      status: 'DRAFT',
      version: 2,
      data: {
        ...defaultCustomization,
        theme: {
          ...defaultCustomization.theme,
          key: 't1',
          colors: {
            primary: '#dc2626',
            secondary: '#64748b',
            accent: '#f59e0b',
          },
        },
        sections: {
          ...defaultCustomization.sections,
          showTestimonials: true,
          showGallery: true, // Draft change
        },
      },
    },
  });

  console.log('✅ Database seeded successfully');
  console.log(`Created dealers: ${dealer1.name}, ${dealer2.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });