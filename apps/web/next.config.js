/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@school-crm/ui', '@school-crm/types', '@school-crm/config'],

  // Allow *.localhost subdomains so the middleware can read the full hostname
  // and images/assets from tenant subdomains are permitted.
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },

  // Allow any subdomain of localhost (and production domains) to be served.
  // This ensures Next.js does not reject requests from e.g. vidyamandir.localhost:3004.
  allowedDevOrigins: ['*.localhost'],
};

module.exports = nextConfig;
