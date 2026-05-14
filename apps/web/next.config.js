const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@tiferet/types', '@tiferet/supabase'],
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tiferet/types': path.resolve(__dirname, '../../packages/types/index.ts'),
      '@tiferet/supabase': path.resolve(__dirname, '../../packages/supabase/index.ts'),
    }
    return config
  },
}

module.exports = nextConfig
