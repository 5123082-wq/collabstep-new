import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://collabverse.local').replace(/\/$/, '');

const marketingPaths = [
  '/',
  '/product',
  '/product/ai',
  '/product/pm',
  '/product/marketplace',
  '/audience',
  '/projects',
  '/projects/cases',
  '/specialists',
  '/contractors',
  '/pricing',
  '/blog',
  '/login',
  '/register',
  '/mkt',
  '/mkt/product',
  '/mkt/product/ai',
  '/mkt/product/pm',
  '/mkt/product/marketplace',
  '/mkt/audience',
  '/mkt/projects',
  '/mkt/projects/cases',
  '/mkt/specialists',
  '/mkt/contractors',
  '/mkt/pricing',
  '/mkt/blog',
  '/mkt/login',
  '/mkt/register'
];

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingPaths.map((path, index) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' || path === '/mkt' ? 1 : Number((0.8 - index * 0.01).toFixed(2))
  }));
}
