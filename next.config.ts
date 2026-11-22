import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function commit(): string {
  const fromHost = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromHost) return fromHost.slice(0, 7);
  try {
    return execSync("git rev-parse --short=7 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  env: {
    BUILD_COMMIT: commit(),
    BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/about", destination: "/#about", permanent: false }];
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
