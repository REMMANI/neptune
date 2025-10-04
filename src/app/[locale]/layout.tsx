import '../globals.css';

export const dynamic = 'force-dynamic';


export default async function RootLayout({ children, params }: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // 👈 await it
  return (
    <html lang={locale}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}