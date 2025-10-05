'use client';
import { Hero, type HeroProps } from '@/blocks/hero';

export default function T1Hero(props: HeroProps) {
  return <div className="ring-1 ring-[color:var(--color-brand-600)] bg-amber-50"><Hero {...props} /></div>;
}
