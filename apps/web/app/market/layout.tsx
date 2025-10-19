import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingLayout from '@/app/(marketing)/layout';
import MarketSidebar from '@/components/marketplace/MarketSidebar';

export const metadata: Metadata = {
  title: 'Маркетплейс Collabverse',
  description: 'Шаблоны, проекты и сервисы для быстрого старта цифровых продуктов.'
};

export default function MarketLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:flex-row lg:gap-16">
        <aside className="lg:w-64 xl:w-72">
          <div className="sticky top-28 hidden lg:block">
            <MarketSidebar />
          </div>
          <div className="lg:hidden">
            <MarketSidebar />
          </div>
        </aside>
        <div className="flex-1 space-y-10 pb-16">{children}</div>
      </div>
    </MarketingLayout>
  );
}
