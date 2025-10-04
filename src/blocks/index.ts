import type { ComponentType } from 'react';
import { Hero } from './hero';
import { Features } from './features';
import { Pricing } from './pricing';
import { Footer } from './footer';

// ---- Props for each block (match your components) ----
export type HeroProps = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  locale?: "en" | "fr" | "es" | "ar";
};

export type FeaturesProps = {
  items: Array<{ title: string; description: string }>;
};

export type PricingProps = {
  plans: Array<{ name: string; price: string; features: string[]; cta?: string }>;
};

export type FooterProps = {
  brand?: { name?: string; logo?: string };
  year?: number;
};

// ---- Map block names to their prop types ----
export type BlockComponentMap = {
  Hero: ComponentType<HeroProps>;
  Features: ComponentType<FeaturesProps>;
  Pricing: ComponentType<PricingProps>;
  Footer: ComponentType<FooterProps>;
};

// ---- Registry (no any) ----
export const BLOCKS: BlockComponentMap = {
  Hero,
  Features,
  Pricing,
  Footer,
};

// ---- Strong types for data coming from templates/API ----
export type BlockOf<K extends keyof BlockComponentMap> = {
  type: K;
  props: React.ComponentProps<BlockComponentMap[K]>;
};

// Discriminated union of all supported blocks (use this for arrays)
export type AnyBlock = {
  [K in keyof BlockComponentMap]: BlockOf<K>
}[keyof BlockComponentMap];
