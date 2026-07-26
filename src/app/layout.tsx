// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';

import type React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

import '../index.css';

import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-jp';

const description =
  'Visa processing times, bureau workloads, and a queue-model estimator for your own application - built on official Immigration Services Agency statistics, updated daily from e-Stat.';

export const metadata: Metadata = {
  metadataBase: new URL('https://dashboard.retrohazard.jp'),
  title: 'Japan Immigration Statistics Dashboard',
  description,
  keywords:
    'Japan visa processing times, immigration bureau statistics, visa application tracker, Immigration Services Agency, e-Stat',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Japan Immigration Statistics Dashboard',
    description,
    url: 'https://dashboard.retrohazard.jp',
    siteName: 'Japan Immigration Statistics Dashboard',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Japan Immigration Statistics Dashboard',
    description,
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#101116' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes stamps the theme class on <html>
    // before hydration, which intentionally differs from the server markup.
    <html lang="en" suppressHydrationWarning>
      <body>
        <div id="root">{children}</div>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
