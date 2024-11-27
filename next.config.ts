import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    ppr: true,
    turbo: {
      rules: {
        "**/*.node.js": {
          alias: {
            canvas: false,
          },
        },
      },
    },
    esmExternals: "loose",
  },
};

export default nextConfig;
