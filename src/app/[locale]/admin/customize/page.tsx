import { requireDealerAccess } from '@/lib/auth';
import { getDealerConfig } from '@/lib/config';
import { dealerService } from '@/lib/dealer-service';
import { LiveCustomizer } from './LiveCustomizer';

export default async function AdminCustomizePage() {
  // Require authentication and dealer access
  const { session, externalDealerId, dealerId } = await requireDealerAccess();

  // Get current dealer info from external API and config
  const [dealer, config] = await Promise.all([
    dealerService.getDealerById(externalDealerId),
    getDealerConfig(externalDealerId, { preview: true })
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
        externalDealerId={externalDealerId}
        dealerId={dealerId}
      />
    </div>
  );
}