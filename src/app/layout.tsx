// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';

import type React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

import { DEFAULT_LOCALE } from '../i18n/config';
import { LOCALES } from '../i18n/locales';
import { en } from '../i18n/locales/en';

import '../index.css';

import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-jp';

// Metadata is emitted at build time into a single prerendered document, so it
// can't follow the visitor's locale — `output: 'export'` leaves no server to
// negotiate one. Reading the English catalogue directly still keeps one source
// of truth, and is what per-locale routes would build on.
const title = en['meta.title'];
const description = en['meta.description'];

export const metadata: Metadata = {
  metadataBase: new URL('https://dashboard.retrohazard.jp'),
  title,
  description,
  keywords: en['meta.keywords'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title,
    description,
    url: 'https://dashboard.retrohazard.jp',
    siteName: title,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: LOCALES[DEFAULT_LOCALE].intlTag.replace('-', '_'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
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
    // lang is the build-time default; LocaleProvider corrects it client-side
    // once detection runs (the app itself is ssr:false).
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <div id="root">{children}</div>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
