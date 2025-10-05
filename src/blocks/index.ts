import { Hero, type HeroProps } from './hero';
import { Features, type FeaturesProps } from './features';
import { Footer, type FooterProps } from './footer';

export const BLOCKS = { Hero, Features, Footer } as const;
export type BlockType = keyof typeof BLOCKS; 

export type BlockOf<K extends BlockType> = {
  type: K;
  props?: Partial<React.ComponentProps<typeof BLOCKS[K]>>;
};

export type AnyBlock = { [K in BlockType]: BlockOf<K> }[BlockType];

export { Hero, Features, Footer };
export type { HeroProps, FeaturesProps, FooterProps };
export const BLOCK_TYPES = Object.keys(BLOCKS) as BlockType[];
