import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Serwist config
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production", // Disable in dev and build due to Turbopack incompatibility
  cacheOnNavigation: true,

  // Pre-cache critical mobile pages for offline navigation
  additionalPrecacheEntries: [
    // Mobile main pages
    { url: "/mobile", revision: "1" },
    { url: "/mobile/work-orders", revision: "1" },
    { url: "/mobile/alerts", revision: "1" },
    { url: "/mobile/attendance", revision: "1" },
    { url: "/mobile/assets", revision: "1" },
    { url: "/mobile/create-work-order", revision: "1" },
    { url: "/mobile/create-alert", revision: "1" },

    // Offline fallback page (MUST be cached)
    { url: "/offline", revision: "1" },

    // Manifest and icons
    { url: "/manifest.json", revision: "1" },
  ],
});

const nextConfig: NextConfig = {
  // Specify the root directory for Turbopack to avoid ambiguity with multiple lockfiles
  turbopack: {
    root: __dirname,
  },
  // Configure allowed image domains and timeout
  images: {
    // Increase timeout for large images from S3
    dangerouslyAllowSVG: true, // Allow SVG for logos
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow unoptimized images in development for subdomain support
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mantenix-dev-brand.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mantenix-assets-dev.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mantenix-assets-dev.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mantenix.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow development server to handle subdomain requests
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
};

export default withSerwist(nextConfig);
