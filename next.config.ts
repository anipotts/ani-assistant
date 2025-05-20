import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* General config options */
  reactStrictMode: true,
  poweredByHeader: false,

  /* Edge Runtime config */
  experimental: {
    // Enable and configure Edge Runtime
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },

  /* Headers for security */
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
