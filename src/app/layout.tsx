// src/app/layout.tsx
import React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Dashboard | Japan Immigration Bureau Statistics',
  description:
    'Track Japanese visa application processing times with clarity! Explore our interactive React dashboard featuring dynamic rolling averages, official Immigration Services Agency statistics, and visual comparisons across regional bureaus. Monitor trends, estimate timelines, and set realistic expectations for your immigration process.',
  keywords:
    'Japan Visa Processing Times, Immigration Bureau Wait Times, Visa Application Tracker, Japan Immigration Statistics, Immigration Dashboard, Data Visualization Tool, Real-Time Visa Analytics, Government Immigration Data, Visa Timeline Estimation, Rolling Averages Calculator, Immigration Trends Japan, Visa Processing Delays, Application Status Tracker, React Data Dashboard, Immigration Services Agency Japan, Regional Bureau Comparisons, Dynamic Visa Estimates, Immigration Transparency Tool',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body>
      <div id="root">{children}</div>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    </body>
    </html>
  );
}
