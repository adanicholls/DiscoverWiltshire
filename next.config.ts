import type { NextConfig } from "next";

// Sponsor images are uploaded to this project's Supabase Storage (see
// /admin/sponsors), so next/image has to be told that host is allowed -
// derived from the same env var the rest of the app already uses rather
// than hardcoding the project URL.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/sponsor-images/**" }]
      : [],
  },
  experimental: {
    // Server Actions default to a 1MB body; sponsor images are accepted up
    // to 2MB (enforced in the action and by the bucket), with headroom for
    // the rest of the form.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
