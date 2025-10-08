import { requireDealerAuth } from '@/lib/auth';
import { TemplateSelector } from './TemplateSelector';

export default async function TemplatesPage() {
  const { session, dealerId } = await requireDealerAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Choose Your Template
          </h1>
          <p className="text-gray-600 mt-2">
            Select a professional template to get started with your website customization.
          </p>
        </div>

        <TemplateSelector session={session} dealerId={dealerId} />
      </div>
    </div>
  );
}