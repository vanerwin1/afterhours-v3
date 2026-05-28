import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Compression for better performance
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",     value: "on" },
        ],
      },
    ]
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Allow external images from Spline / common CDNs
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prod.spline.design" },
    ],
  },

  // Turbopack is the default in Next 16 — no explicit config needed
}

export default nextConfig
