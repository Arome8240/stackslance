import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@stacks/transactions",
    "@stacks/connect",
    "@stacks/network",
  ],
};

export default nextConfig;
