import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright's e2e suite runs against http://127.0.0.1:3000 (see
  // playwright.config.ts). Without this, Next.js's dev server blocks HMR/
  // static-chunk requests from that origin, which silently prevents client
  // components from hydrating — e2e tests then load the page fine but any
  // interaction that depends on React state (button clicks, etc.) does
  // nothing, with no error surfaced anywhere.
  allowedDevOrigins: ["127.0.0.1"],
  /* config options here */
};

export default nextConfig;
