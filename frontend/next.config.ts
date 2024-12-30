import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-left",
    appIsrStatus: false,
  },
};

export default nextConfig;