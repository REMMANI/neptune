import { requireDealerAuth } from '@/lib/auth';
import { getDealerConfig } from '@/lib/config';
import { findDealerById } from '@/lib/db';
import { LiveCustomizer } from './LiveCustomizer';

export default async function AdminCustomizePage() {
  // Require authentication and dealer access
  const { session, dealerId } = await requireDealerAuth();

  // Get current dealer info and config
  const [dealer, config] = await Promise.all([
    findDealerById(dealerId),
    getDealerConfig(dealerId, { preview: true })
  ]);

  if (!dealer) {
    throw new Error('Dealer not found');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveCustomizer
        session={session}
        dealer={dealer}
        initialConfig={config}
        dealerId={dealerId}
      />
    </div>
  );
}