import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const storageOrigin = supabaseUrl && URL.canParse(supabaseUrl) ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  images: {
    maximumRedirects: 0,
    remotePatterns: storageOrigin?.protocol === "https:"
      ? [new URL("/storage/v1/object/public/cms-public/**", storageOrigin)]
      : [],
  },
};

export default nextConfig;
