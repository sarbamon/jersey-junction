import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    const defaultBackend = process.env.NODE_ENV === 'production'
      ? 'https://aqua-pheasant-372889.hostingersite.com/api'
      : 'http://localhost:5000/api';
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || defaultBackend).trim();
    const cleanUrl = rawUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${cleanUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${cleanUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
