import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ainanobanana.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.ainanobanana.io',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: 'nano-banana-ai'
  }
};

export default nextConfig;
