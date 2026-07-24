/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "homeintownapi.codixlysolutions.in",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
