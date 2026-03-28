import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "sfquagoyqohqnaziuqda.supabase.co" },
      { hostname: "epbbgpzkmmaeropqlsrr.supabase.co" },
    ],
  },
};

export default nextConfig;
