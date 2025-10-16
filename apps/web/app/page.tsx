import MarketingLayout from '@/app/(marketing)/layout';
import MarketingPage, { dynamic, metadata } from '@/app/(marketing)/page';
import { NAV_V1 } from '@/lib/feature-flags';

export { metadata, dynamic };

export default function RootPage() {
  if (!NAV_V1) {
    return <MarketingPage />;
  }

  return (
    <MarketingLayout>
      <MarketingPage />
    </MarketingLayout>
  );
}
