import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
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

export default nextConfig
