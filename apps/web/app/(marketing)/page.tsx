import type { Metadata } from 'next';
import { NAV_V1 } from '@/lib/feature-flags';
import Stage0 from '../_pages/stage0';
import ClientMarker from './_components/client-marker';
import MarketingHome from './_pages/home';

export const metadata: Metadata = {
  title: 'Collabverse — платформа для запуска проектов',
  description:
    'AI-агенты, управление проектами и маркетплейс услуг в Collabverse помогают командам запускать продукты быстрее.',
  openGraph: {
    title: 'Collabverse — платформа для запуска проектов',
    description:
      'AI-агенты, управление проектами и маркетплейс услуг в Collabverse помогают командам запускать продукты быстрее.',
    url: '/',
    type: 'website'
  }
};

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!NAV_V1) {
    return <Stage0 />;
  }

  return (
    <>
      <ClientMarker />
      <MarketingHome />
    </>
  );
}
