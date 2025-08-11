/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['http://192.168.1.3:8005'],
  },
};

module.exports = nextConfig;
