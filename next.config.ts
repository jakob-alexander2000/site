import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingIncludes: {
    "/*": [
      "./content/fixtures/manifest.json",
      "./content/fixtures/citebot/**/*",
      "./content/fixtures/citebot-evals/**/*",
    ],
  },
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/about", destination: "/", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
