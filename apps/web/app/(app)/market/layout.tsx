import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  title: 'Маркетплейс Collabverse',
  description: 'Шаблоны, проекты и сервисы для быстрого старта цифровых продуктов.'
};

export default function MarketLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-10 pb-16">{children}</div>;
}
