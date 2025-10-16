import CTA from '@/components/marketing/sections/CTA';
import Audience from '@/components/marketing/sections/Audience';
import Features from '@/components/marketing/sections/Features';
import Hero from '@/components/marketing/sections/Hero';

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <Features />
      <Audience />
      <CTA />
    </>
  );
}
