'use client';
import { type HeroProps } from '@/blocks/hero';

export default function Dealer102324Hero({ title = 'Prime Drive — Hero', subtitle }: HeroProps) {
  return (
    <section className="py-24 bg-red-50 ring-1 ring-red-200 rounded-2xl">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-red-700">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-red-600">{subtitle}</p>}
      </div>
    </section>
  );
}
