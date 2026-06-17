import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
