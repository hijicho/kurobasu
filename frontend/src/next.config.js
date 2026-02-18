/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    // figma:asset スキーマのサポート
    config.resolve.alias['figma:asset'] = false;
    return config;
  },
}

module.exports = nextConfig
