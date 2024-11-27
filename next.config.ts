import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    ppr: true,
    turbo: {
      rules: {
        // Handle .node files
        "**/*.node": {
          loaders: ["raw-loader"],
        },
      },
    },
    esmExternals: "loose",
  },
};

export default nextConfig;
