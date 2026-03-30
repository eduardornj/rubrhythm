import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xyn3cm3fwwtbtsnu.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve('./components'),
      '@app-components': path.resolve('./app/components'),
      '@lib': path.resolve('./lib'),
    };
    // Copy fonts to server chunks so fontconfig can find them on Vercel
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { from: 'lib/fonts', to: 'chunks/fonts' },
          ],
        })
      );
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      // Cache city/state pages for 1 hour (saves CPU from bot crawls)
      {
        source: '/:locale/united-states/:state/:city',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=7200' },
        ],
      },
      {
        source: '/:locale/united-states/:state',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=7200' },
        ],
      },
      {
        source: '/:locale/united-states',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=7200' },
        ],
      },
      // Cache listing pages for 10 minutes
      {
        source: '/:locale/united-states/:state/:city/massagists/:slug',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=600, stale-while-revalidate=1200' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self'",
              "connect-src 'self' https://rubrhythm.com https://www.rubrhythm.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://api.nowpayments.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
