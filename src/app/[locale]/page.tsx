import { getCurrentTenant } from '@/lib/tenant';
import { getDealerConfig } from '@/lib/config';
import { Hero } from '@/blocks/hero';
import { Features } from '@/blocks/features';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
};

const getCMSContent = async () => {
  return {
    hero: {
      title: "Premium Motors",
      subtitle: "Your trusted automotive partner since 1995",
      description: "Discover our extensive collection of quality pre-owned vehicles, backed by our commitment to excellence and customer satisfaction.",
      cta: {
        text: "View Inventory",
        href: "/inventory"
      },
      backgroundImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80"
    },
    features: [
      {
        title: "Quality Guarantee",
        description: "Every vehicle undergoes comprehensive inspection",
        icon: "shield-check"
      },
      {
        title: "Financing Options",
        description: "Flexible financing solutions for every budget",
        icon: "credit-card"
      },
      {
        title: "Expert Service",
        description: "Professional maintenance and repair services",
        icon: "wrench"
      }
    ]
  };
};

export default async function Home({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { preview } = await searchParams;

  const tenant = await getCurrentTenant();
  const config = await getDealerConfig(tenant.dealerId, { preview: !!preview });
  const content = await getCMSContent();

  return (
    <main>
      {config.sections.showHero && (
        <Hero
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          locale={locale}
        />
      )}

      {config.sections.showFeatures && (
        <Features items={content.features} />
      )}
    </main>
  );
}

export async function generateMetadata() {
  return {
    title: `Home - Premium Motors`,
    description: "Your trusted automotive partner since 1995. Discover quality pre-owned vehicles with financing options and expert service.",
    openGraph: {
      title: `Home - Premium Motors`,
      description: "Your trusted automotive partner since 1995.",
      type: 'website',
    },
  };
}
