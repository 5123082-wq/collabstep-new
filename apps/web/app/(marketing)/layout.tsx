import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import Footer from '@/components/marketing/sections/Footer';
import ToastHub from '@/components/app/ToastHub';
import { NAV_V1 } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Collabverse — платформа для совместной работы',
  description:
    'Collabverse объединяет бизнес, дизайнеров, разработчиков и подрядчиков на одной платформе.'
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  if (!NAV_V1) {
    return (
      <>
        {children}
        <ToastHub />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastHub />
    </div>
  );
}
