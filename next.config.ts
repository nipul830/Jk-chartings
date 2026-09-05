import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Jk-chartings",
  assetPrefix: "/Jk-chartings",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Optimize for static
  reactStrictMode: true,
};

export default nextConfig;
