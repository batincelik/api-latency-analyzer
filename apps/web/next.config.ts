import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ala/types'],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
