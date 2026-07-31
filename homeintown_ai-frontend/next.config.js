/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // Uncomment for production static build
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "homeintownapi.codixlysolutions.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-daa9113fecb449cfb19044d3d822effd.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
