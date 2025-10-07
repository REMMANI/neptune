import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ["*"],
  },
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};
export default nextConfig;