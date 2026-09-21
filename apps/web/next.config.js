import { env } from "@repo/env";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load shared packages/env/.env (via @repo/env) and expose public vars to the browser.
  // Client components must use process.env.NEXT_PUBLIC_* — never import @repo/env.
  env: {
    NEXT_PUBLIC_BACKEND_URL: env.NEXT_PUBLIC_BACKEND_URL,
  },
};

export default nextConfig;
