import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Disable Next.jss Image Optimization API ensuring images load directly from WP
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'mayaadrenaline.local',
      },
      {
        protocol: 'https',
        hostname: 'mayaadrenaline.local',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
      {
        protocol: 'https',
        hostname: 'back.mayaadrenaline.com.mx',
      },
    ],
  },
  output: 'export', // Enable static export for traditional hosting
  trailingSlash: true, // Generate pages as directories (e.g. /about/index.html) instead of files (e.g. /about.html)
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;
