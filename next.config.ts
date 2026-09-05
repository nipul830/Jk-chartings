import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Jk-chartings",
  assetPrefix: "/Jk-chartings/",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
