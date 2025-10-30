/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/yoqr/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/yoqr' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withPWA(nextConfig);
