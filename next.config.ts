import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profile photo uploads go through a Server Action as a raw file; give
      // it enough headroom for a ~2MB image plus multipart overhead.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
