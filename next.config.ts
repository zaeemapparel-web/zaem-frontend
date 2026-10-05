import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ==================== IMAGES ====================
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // ==================== EXPERIMENTAL ====================
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // ==================== COMPILER ====================
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // ==================== REACT ====================
  reactStrictMode: true,

  // ==================== MISC ====================
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  // ==================== HEADERS ====================
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;