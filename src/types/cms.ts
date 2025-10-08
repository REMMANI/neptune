import { z } from 'zod';

// Base menu item schema
export const MenuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  slug: z.string().optional(),
  href: z.string().optional(),
  target: z.enum(['_self', '_blank', '_parent', '_top']).default('_self'),
  order: z.number().default(0),
  children: z.array(z.lazy(() => MenuItemSchema)).optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

// Page block schemas
export const HeroBlockSchema = z.object({
  type: z.literal('hero'),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  backgroundType: z.enum(['image', 'video', 'gradient']).default('image'),
});

export const FeaturesBlockSchema = z.object({
  type: z.literal('features'),
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: z.string().optional(),
  })),
});

export const RichTextBlockSchema = z.object({
  type: z.literal('richText'),
  id: z.string(),
  html: z.string(),
  className: z.string().optional(),
});

export const GalleryBlockSchema = z.object({
  type: z.literal('gallery'),
  id: z.string(),
  title: z.string().optional(),
  images: z.array(z.object({
    id: z.string(),
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  })),
  layout: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
});

export const TestimonialBlockSchema = z.object({
  type: z.literal('testimonial'),
  id: z.string(),
  testimonials: z.array(z.object({
    id: z.string(),
    content: z.string(),
    author: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
  })),
});

export const ContactFormBlockSchema = z.object({
  type: z.literal('contactForm'),
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(), // For select fields
  })),
});

// Union of all block types
export const PageBlockSchema = z.discriminatedUnion('type', [
  HeroBlockSchema,
  FeaturesBlockSchema,
  RichTextBlockSchema,
  GalleryBlockSchema,
  TestimonialBlockSchema,
  ContactFormBlockSchema,
]);

export type PageBlock = z.infer<typeof PageBlockSchema>;
export type HeroBlock = z.infer<typeof HeroBlockSchema>;
export type FeaturesBlock = z.infer<typeof FeaturesBlockSchema>;
export type RichTextBlock = z.infer<typeof RichTextBlockSchema>;
export type GalleryBlock = z.infer<typeof GalleryBlockSchema>;
export type TestimonialBlock = z.infer<typeof TestimonialBlockSchema>;
export type ContactFormBlock = z.infer<typeof ContactFormBlockSchema>;

// Page schema
export const PageSchema = z.object({
  id: z.string(),
  locale: z.string(),
  slug: z.array(z.string()),
  title: z.string(),
  description: z.string().optional(),
  canonical: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().default(false),
  blocks: z.array(PageBlockSchema),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  template: z.string().default('default'),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
});

export type Page = z.infer<typeof PageSchema>;

// CMS Bundle schema (contains menu + activated sections)
export const CmsBundleSchema = z.object({
  menu: z.array(MenuItemSchema),
  sections: z.object({
    showHero: z.boolean().default(true),
    showFeatures: z.boolean().default(true),
    showFooter: z.boolean().default(true),
    showInventoryLink: z.boolean().default(true),
    showTestimonials: z.boolean().default(false),
    showGallery: z.boolean().default(false),
    showContactForm: z.boolean().default(true),
  }),
  theme: z.object({
    key: z.string().default('base'),
    customColors: z.record(z.string()).optional(),
    customFonts: z.record(z.string()).optional(),
    customSpacing: z.record(z.string()).optional(),
  }).optional(),
});

export type CmsBundle = z.infer<typeof CmsBundleSchema>;

// SEO metadata schema
export const SeoMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  ogType: z.string().default('website'),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonical: z.string().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;