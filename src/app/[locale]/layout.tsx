import '../globals.css';
import { getConfig } from '@/lib/config';
import Nav from '@/themes/base/components/Nav';


export const dynamic = 'force-static'; // build-time only
export const revalidate = false; // disable ISR for strict build-time


export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cfg = await getConfig();
  return (
    <html lang={locale}>
      <body>
        <Nav menu={cfg.raw.menu} logo={cfg.raw.logo} locale={locale} />
        {children}
      </body>
    </html>
  );
}