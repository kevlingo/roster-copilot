/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to focus on TypeScript issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
