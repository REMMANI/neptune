'use client';


type Plan = {
    price: string | number;
    name: string;
    features?: string[];
    cta?: string;
};

interface PricingProps {
    plans?: Plan[];
}

export function Pricing({ plans = [] }: PricingProps) {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4 grid gap-6 md:grid-cols-3">
                {plans.map((p: Plan, i: number) => (
                    <div key={i} className="rounded-2xl border p-6 shadow-sm bg-white/80">
                        <div className="text-3xl font-bold">{p.price}</div>
                        <div className="mt-1 text-slate-500">{p.name}</div>
                        <ul className="mt-4 space-y-2 text-sm text-slate-600">
                            {p.features?.map((x: string, j: number) => <li key={j}>• {x}</li>)}
                        </ul>
                        <a href="#" className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2 text-white">{p.cta || 'Choose'}</a>
                    </div>
                ))}
            </div>
        </section>
    );
}