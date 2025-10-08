import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('🎨 Seeding templates...');

  // Template 1: Modern Business
  await prisma.$executeRaw`
    INSERT INTO templates (id, name, description, preview, sections, settings, "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Modern Business',
      'Clean and professional design perfect for automotive dealerships',
      '/templates/modern-business.jpg',
      '[
        {"id": "hero", "name": "Hero Banner", "type": "hero", "enabled": true, "order": 1},
        {"id": "features", "name": "Key Features", "type": "features", "enabled": true, "order": 2},
        {"id": "inventory", "name": "Vehicle Inventory", "type": "inventory", "enabled": true, "order": 3},
        {"id": "about", "name": "About Us", "type": "about", "enabled": true, "order": 4},
        {"id": "contact", "name": "Contact Info", "type": "contact", "enabled": true, "order": 5}
      ]',
      '{
        "colors": {
          "primary": "#2563eb",
          "secondary": "#64748b",
          "accent": "#f59e0b"
        },
        "typography": {
          "headingFont": "Inter",
          "bodyFont": "Inter"
        },
        "layout": {
          "maxWidth": "1200px",
          "spacing": "medium"
        }
      }',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
  `;

  // Template 2: Luxury Auto
  await prisma.$executeRaw`
    INSERT INTO templates (id, name, description, preview, sections, settings, "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Luxury Auto',
      'Elegant and sophisticated design for premium automotive brands',
      '/templates/luxury-auto.jpg',
      '[
        {"id": "hero", "name": "Hero Showcase", "type": "hero", "enabled": true, "order": 1},
        {"id": "luxury-features", "name": "Premium Features", "type": "features", "enabled": true, "order": 2},
        {"id": "gallery", "name": "Vehicle Gallery", "type": "gallery", "enabled": true, "order": 3},
        {"id": "services", "name": "Our Services", "type": "services", "enabled": true, "order": 4},
        {"id": "testimonials", "name": "Client Reviews", "type": "testimonials", "enabled": true, "order": 5},
        {"id": "contact", "name": "Get in Touch", "type": "contact", "enabled": true, "order": 6}
      ]',
      '{
        "colors": {
          "primary": "#1f2937",
          "secondary": "#d4af37",
          "accent": "#ef4444"
        },
        "typography": {
          "headingFont": "Poppins",
          "bodyFont": "Open Sans"
        },
        "layout": {
          "maxWidth": "1400px",
          "spacing": "large"
        }
      }',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
  `;

  // Template 3: Classic Motors
  await prisma.$executeRaw`
    INSERT INTO templates (id, name, description, preview, sections, settings, "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Classic Motors',
      'Traditional and reliable design for established dealerships',
      '/templates/classic-motors.jpg',
      '[
        {"id": "header", "name": "Header Banner", "type": "hero", "enabled": true, "order": 1},
        {"id": "inventory-grid", "name": "Vehicle Grid", "type": "inventory", "enabled": true, "order": 2},
        {"id": "why-choose", "name": "Why Choose Us", "type": "features", "enabled": true, "order": 3},
        {"id": "financing", "name": "Financing Options", "type": "services", "enabled": true, "order": 4},
        {"id": "location", "name": "Visit Our Showroom", "type": "contact", "enabled": true, "order": 5}
      ]',
      '{
        "colors": {
          "primary": "#dc2626",
          "secondary": "#374151",
          "accent": "#059669"
        },
        "typography": {
          "headingFont": "Roboto",
          "bodyFont": "Roboto"
        },
        "layout": {
          "maxWidth": "1100px",
          "spacing": "compact"
        }
      }',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
  `;

  console.log('✅ Templates seeded successfully!');
  console.log('Created 3 templates:');
  console.log('- Modern Business (Professional & Clean)');
  console.log('- Luxury Auto (Elegant & Sophisticated)');
  console.log('- Classic Motors (Traditional & Reliable)');
}

seedTemplates()
  .catch((e) => {
    console.error('❌ Template seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });