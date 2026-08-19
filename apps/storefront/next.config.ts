import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.adiktclothing.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        buffer: false,
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
