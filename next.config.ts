import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimize Sanity-hosted assets.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
