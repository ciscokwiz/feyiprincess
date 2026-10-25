import type { NextConfig } from "next";

/**
 * Static export: `next build` writes a plain HTML/CSS/JS site to `out/`.
 * No server or backend is needed, so it deploys to Vercel or any static host.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
