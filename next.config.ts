import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "brave-spider-640.convex.cloud",
        protocol: "https",
      },
      {
        hostname: "pastel-jay-955.convex.cloud",
        protocol: "https"
      },
    ],
  },
};

export default nextConfig;
