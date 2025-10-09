import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_THEMES = [
  {
    key: 'base',
    name: 'Base Theme',
    description: 'Clean and professional design perfect for any automotive dealership',
    previewImage: '/themes/base/preview.jpg',
    category: 'AUTOMOTIVE' as const,
    isDefault: true,
    isSystemTheme: true,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8'
      },
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '4rem',
      cardPadding: '1.5rem',
      buttonPadding: '0.5rem 1rem',
      inputPadding: '0.75rem 1rem'
    },
    components: {
      button: {
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 500,
        padding: '0.75rem 1.5rem',
        transition: 'all 0.2s ease'
      },
      card: {
        borderRadius: '12px',
        padding: '1.5rem',
        shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0'
      },
      input: {
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        fontSize: '1rem'
      }
    },
    tags: ['modern,clean,professional,automotive'],
    sortOrder: 0,
    version: '1.0.0'
  },
  {
    key: 't1',
    name: 'Bold Red',
    description: 'Dynamic red theme with strong visual impact for performance-focused dealerships',
    previewImage: '/themes/t1/preview.jpg',
    category: 'AUTOMOTIVE' as const,
    isDefault: false,
    isSystemTheme: true,
    colors: {
      primary: '#dc2626',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#fef2f2',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8'
      },
      border: '#fecaca',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '4rem',
      cardPadding: '1.5rem',
      buttonPadding: '0.5rem 1rem',
      inputPadding: '0.75rem 1rem'
    },
    components: {
      button: {
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        padding: '0.875rem 1.75rem',
        transition: 'all 0.3s ease'
      },
      card: {
        borderRadius: '16px',
        padding: '1.5rem',
        shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        border: '1px solid #fecaca'
      },
      input: {
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        border: '2px solid #fecaca',
        fontSize: '1rem'
      }
    },
    tags: ['bold,red,performance,automotive,dynamic'],
    sortOrder: 1,
    version: '1.0.0'
  },
  {
    key: 'luxury',
    name: 'Luxury Gold',
    description: 'Premium gold and black theme perfect for high-end luxury dealerships',
    previewImage: '/themes/luxury/preview.jpg',
    category: 'LUXURY' as const,
    isDefault: false,
    isSystemTheme: true,
    colors: {
      primary: '#d97706',
      secondary: '#1f2937',
      accent: '#fbbf24',
      background: '#ffffff',
      surface: '#fffbeb',
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        muted: '#9ca3af'
      },
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '5rem',
      cardPadding: '2rem',
      buttonPadding: '0.75rem 1.5rem',
      inputPadding: '1rem 1.25rem'
    },
    components: {
      button: {
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 600,
        padding: '1rem 2rem',
        transition: 'all 0.3s ease'
      },
      card: {
        borderRadius: '8px',
        padding: '2rem',
        shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        border: '1px solid #fed7aa'
      },
      input: {
        borderRadius: '6px',
        padding: '1rem 1.25rem',
        border: '1px solid #fed7aa',
        fontSize: '1rem'
      }
    },
    tags: ['luxury,premium,gold,elegant,sophisticated'],
    sortOrder: 2,
    version: '1.0.0'
  },
  {
    key: 'modern',
    name: 'Modern Dark',
    description: 'Sleek dark theme with blue accents for contemporary automotive brands',
    previewImage: '/themes/modern/preview.jpg',
    category: 'MODERN' as const,
    isDefault: false,
    isSystemTheme: true,
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#111827',
      surface: '#1f2937',
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        muted: '#9ca3af'
      },
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      containerWidth: '1280px',
      sectionPadding: '4rem',
      cardPadding: '1.5rem',
      buttonPadding: '0.5rem 1rem',
      inputPadding: '0.75rem 1rem'
    },
    components: {
      button: {
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 500,
        padding: '0.75rem 1.5rem',
        transition: 'all 0.2s ease'
      },
      card: {
        borderRadius: '12px',
        padding: '1.5rem',
        shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: '1px solid #374151'
      },
      input: {
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #4b5563',
        fontSize: '1rem'
      }
    },
    tags: ['modern,dark,blue,contemporary,sleek'],
    sortOrder: 3,
    version: '1.0.0'
  }
];

export async function seedThemes() {
  console.log('🎨 Seeding default themes...');

  for (const themeData of DEFAULT_THEMES) {
    await prisma.theme.upsert({
      where: { key: themeData.key },
      update: {
        name: themeData.name,
        description: themeData.description,
        previewImage: themeData.previewImage,
        category: themeData.category,
        isDefault: themeData.isDefault,
        colors: themeData.colors,
        typography: themeData.typography,
        spacing: themeData.spacing,
        components: themeData.components,
        tags: themeData.tags,
        sortOrder: themeData.sortOrder,
        version: themeData.version,
        isActive: true,
        isSystemTheme: true
      },
      create: themeData
    });

    console.log(`  ✓ ${themeData.name} (${themeData.key})`);
  }

  console.log('🎨 Theme seeding completed!');
}

if (require.main === module) {
  seedThemes()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}