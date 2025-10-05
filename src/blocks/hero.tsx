'use client';

export type HeroProps = {
  title?: string;
  subtitle?: string;
  locale?: string;
};

// 👇 make sure the exported name is *Hero*
export function Hero({ title = 'Welcome', subtitle }: HeroProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-slate-600">{subtitle}</p>}
      </div>
    </section>
  );
}
