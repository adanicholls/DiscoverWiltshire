import type { NextConfig } from "next";

// Sponsor and journal images are uploaded to this project's Supabase Storage
// (see /admin/sponsors and /admin/journal), so next/image has to be told that
// host is allowed -
// derived from the same env var the rest of the app already uses rather
// than hardcoding the project URL.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  // "Our story" (/about) became the Journal - keep old links and bookmarks
  // working with a permanent redirect.
  async redirects() {
    return [{ source: "/about", destination: "/journal", permanent: true }];
  },
  images: {
    remotePatterns: supabaseHost
      ? ["sponsor-images", "journal-images"].map((bucket) => ({
          protocol: "https" as const,
          hostname: supabaseHost,
          pathname: `/storage/v1/object/public/${bucket}/**`,
        }))
      : [],
  },
  experimental: {
    // Server Actions default to a 1MB body. Sponsor images are accepted up
    // to 2MB and journal images up to 3MB (enforced in the actions and by
    // the buckets); 4MB leaves headroom for the rest of the form while
    // staying under Vercel's 4.5MB request limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
