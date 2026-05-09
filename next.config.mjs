/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
    responseLimit: '500mb',
  },
};

export default nextConfig;
