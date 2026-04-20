import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "pdf-parse", "canvas", "@napi-rs/canvas", "@prisma/client"],
};

export default nextConfig;
