import { NAV_V1 } from '@/lib/feature-flags';
import Stage0 from './_pages/stage0';
import MarketingLayout from './(marketing)/layout';
import MarketingHome from './(marketing)/_pages/home';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!NAV_V1) {
    return <Stage0 />;
  }

  return (
    <MarketingLayout>
      <MarketingHome />
    </MarketingLayout>
  );
}
