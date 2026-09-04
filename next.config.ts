import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profile photo uploads go through a Server Action as a raw file; give
      // it enough headroom for a ~2MB image plus multipart overhead.
      bodySizeLimit: "3mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: "barretoor",
  project: "insurance-crm",
  // No SENTRY_AUTH_TOKEN is configured, so source map upload is skipped -
  // errors still report fine, just with minified stack traces. Add that env
  // var (from Sentry -> Settings -> Auth Tokens) to enable it.
  silent: true,
  widenClientFileUpload: true,
});
