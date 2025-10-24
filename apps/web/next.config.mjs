/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};
export default nextConfig;
