import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ------------------------------------------------------------------
  // TEMPORARY: Ignore TypeScript errors during the production build.
  // Remove this once all types are fixed properly.
  // ------------------------------------------------------------------
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allowed origins for local development (useful with tunnels/hotspots)
  allowedDevOrigins: [
    '172.20.10.2',
    'localhost',
    '127.0.0.1',
    'nonperilous-thieveless-emiko.ngrok-free.dev',
    'kd6z730f-3000.uks1.devtunnels.ms',
  ],

  // Apply rewrites only during local development.
  // In production, the frontend uses the absolute backend URL from NEXT_PUBLIC_API_URL.
  ...(process.env.NODE_ENV !== 'production' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
        {
          source: '/media/:path*',
          destination: 'http://127.0.0.1:8000/media/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;