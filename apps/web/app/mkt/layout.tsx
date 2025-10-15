import type { ReactNode } from 'react';
import MarketingLayout from '@/app/(marketing)/layout';
export { metadata } from '@/app/(marketing)/layout';

export default function MktLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
