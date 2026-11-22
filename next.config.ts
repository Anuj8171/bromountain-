import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["galore-thrive-atonable.ngrok-free.dev"],
  images: {
    // Adventure, section and review photos are served from Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
