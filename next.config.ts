import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // clients.buildwithjazz.com/sarah@test.com → /dashboard?email=sarah@test.com
      {
        source: "/:email",
        has: [
          {
            type: "host",
            value: "clients.buildwithjazz.com",
          },
        ],
        destination: "/dashboard?email=:email",
      },
      // clients.buildwithjazz.com → /dashboard
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "clients.buildwithjazz.com",
          },
        ],
        destination: "/dashboard",
      },
    ];
  },
};

export default nextConfig;
