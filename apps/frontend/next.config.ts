import type { NextConfig } from "next";
import { env } from "@repo/env";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BACKEND_URL: env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_WS_URL: env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
