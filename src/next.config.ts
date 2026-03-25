import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/owners',
        destination: 'https://boss.smartlink.id/api/owners',
      },
    ];
  },
  /* tambahkan config lain di sini */
};

export default nextConfig;
