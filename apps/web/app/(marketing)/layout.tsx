import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import Footer from '@/components/marketing/sections/Footer';

export const metadata: Metadata = {
  title: 'Collabverse — платформа для совместной работы',
  description:
    'Collabverse объединяет бизнес, дизайнеров, разработчиков и подрядчиков на одной платформе.'
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
