'use client';


interface FeatureItem {
    title: string;
    description: string;
}

interface FeaturesProps {
    items?: FeatureItem[];
}

export function Features({ items = [] }: FeaturesProps) {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4 grid gap-6 md:grid-cols-3">
                {items.map((f, i: number) => (
                    <div key={i} className="rounded-2xl border p-6 shadow-sm bg-white/80">
                        <h3 className="text-xl font-semibold">{f.title}</h3>
                        <p className="mt-2 text-slate-600">{f.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}