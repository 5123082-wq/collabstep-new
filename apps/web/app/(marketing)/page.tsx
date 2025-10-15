import type { Metadata } from 'next';
import MarketingHome from './_pages/Home';

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

export default function Page() {
  return <MarketingHome />;
}
