/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'replit.com'],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
}

module.exports = nextConfig
