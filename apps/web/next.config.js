/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@school-crm/ui', '@school-crm/types', '@school-crm/config'],
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
