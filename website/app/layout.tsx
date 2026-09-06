import type { Metadata, Viewport } from 'next';
import './globals.css';

/* Self-hosted fonts — no third-party request at runtime, and Bangla glyphs
   (Hind Siliguri) are bundled rather than fetched from Google. */
import '@fontsource-variable/inter';
import '@fontsource/hind-siliguri/300.css';
import '@fontsource/hind-siliguri/400.css';
import '@fontsource/hind-siliguri/500.css';
import '@fontsource/hind-siliguri/600.css';
import '@fontsource/hind-siliguri/700.css';

import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${site.brand.journey} — ${site.brand.tagline}`,
    template: `%s · ${site.brand.journey}`,
  },
  description:
    'সাবিহার সাহস, আশা আর সুস্থ হয়ে ওঠার গল্প। আপনিও সাবিহার জন্য একটু ভালো কথা লিখতে পারেন।',
  keywords: ["Sabiha's Journey", 'সাবিহা', 'hope', 'healing', 'messages for Sabiha'],
  openGraph: {
    title: `${site.brand.journey} — ${site.brand.tagline}`,
    description: 'সাবিহার জন্য একটু ভালো কথা লিখুন। ❤️',
    type: 'website',
    locale: 'bn_BD',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FDFAF5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-dvh bg-paper font-bn">{children}</body>
    </html>
  );
}
