// src/app/[[...slug]]/page.tsx
import { ClientWrapper } from './client';

export function generateStaticParams() {
  return [
    { slug: [''] },
    { slug: ['logo192'] },
    { slug: ['logo512'] },
    { slug: ['apple-touch-icon'] },
    { slug: ['apple-touch-icon-precomposed'] },
  ];
}

export default function Home() {
  return <ClientWrapper />;
}
