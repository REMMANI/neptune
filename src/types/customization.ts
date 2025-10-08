import { z } from 'zod';
import { MenuItemSchema } from './cms';

export const ThemeTokensSchema = z.object({
  borderRadius: z.string().default('8px'),
  shadowSm: z.string().default('0 1px 2px 0 rgb(0 0 0 / 0.05)'),
  shadowMd: z.string().default('0 4px 6px -1px rgb(0 0 0 / 0.1)'),
});

export const ThemeColorsSchema = z.object({
  primary: z.string().default('#3b82f6'),
  secondary: z.string().default('#64748b'),
  accent: z.string().default('#f59e0b'),
});

export const ThemeTypographySchema = z.object({
  headingFont: z.string().default('Inter'),
  bodyFont: z.string().default('Inter'),
});

export const ThemeSpacingSchema = z.object({
  containerWidth: z.string().default('1280px'),
  sectionPadding: z.string().default('4rem'),
});

export const ThemeConfigSchema = z.object({
  key: z.string().default('base'),
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  spacing: ThemeSpacingSchema,
});

export const SectionsConfigSchema = z.object({
  showHero: z.boolean().default(true),
  showFeatures: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  showInventoryLink: z.boolean().default(true),
  showTestimonials: z.boolean().default(false),
  showGallery: z.boolean().default(false),
  showContactForm: z.boolean().default(true),
});

export const DealerConfigSchema = z.object({
  theme: ThemeConfigSchema,
  sections: SectionsConfigSchema,
  menu: z.array(MenuItemSchema),
  tokens: ThemeTokensSchema,
});

export const DealerCustomizationSchema = z.object({
  id: z.string(),
  dealerId: z.string(),
  version: z.number(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  data: DealerConfigSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type ThemeTypography = z.infer<typeof ThemeTypographySchema>;
export type ThemeSpacing = z.infer<typeof ThemeSpacingSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type SectionsConfig = z.infer<typeof SectionsConfigSchema>;
export type DealerConfig = z.infer<typeof DealerConfigSchema>;
export type DealerCustomization = z.infer<typeof DealerCustomizationSchema>;