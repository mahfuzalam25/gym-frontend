import type { NextConfig } from "next";

// @ts-expect-error - next-pwa does not have official TypeScript definitions
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withPWA(nextConfig);