import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  images: {
    domains: ["*"],
  },
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};
export default nextConfig;