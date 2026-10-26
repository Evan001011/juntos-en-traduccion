import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Gives `next dev` the same D1/R2 bindings the Worker gets in production. Only
// initialise during development: `next build` runs parallel workers that would
// otherwise all open the same local D1 file.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });
}

const nextConfig: NextConfig = {};

export default nextConfig;
