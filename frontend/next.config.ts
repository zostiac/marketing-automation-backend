import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Surface type errors at build time rather than in production.
  // (Next 16 removed the top-level `eslint` key; lint runs via `npm run lint`.)
  typescript: { ignoreBuildErrors: false },

  // If you later render generated posters from a remote host (S3/R2/Railway),
  // whitelist it here so next/image can optimise them.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.railway.app' },
      { protocol: 'https', hostname: '**.up.railway.app' },
    ],
  },
};

export default nextConfig;
