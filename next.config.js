/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['mysql2'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client bundle from trying to resolve Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        stream: false,
        crypto: false,
        string_decoder: false,
        buffer: false,
        path: false,
        os: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
