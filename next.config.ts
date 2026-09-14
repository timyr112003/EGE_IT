import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["preview-chat-b456764e-1f33-4713-b04d-345ee3c03d65.space-z.ai"],
};

export default nextConfig;
