import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '172.20.10.2',
    'localhost',
    '127.0.0.1',
    'nonperilous-thieveless-emiko.ngrok-free.dev',   // if still using ngrok
    'kd6z730f-3000.uks1.devtunnels.ms',             // if still using VS Code forwarding
  ],
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
};

export default nextConfig;