
type PageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Mock vehicle data - in real app, fetch from inventory API
  const vehicle = {
    id,
    year: 2022,
    make: 'Toyota',
    model: 'Camry',
    price: 25999,
    mileage: 15000,
    description: 'Well-maintained vehicle with full service history.',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80']
  };

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <img
              src={vehicle.images[0]}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-2xl font-semibold text-green-600 mt-2">
              ${vehicle.price.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-2">{vehicle.mileage.toLocaleString()} miles</p>
            <p className="mt-4">{vehicle.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
