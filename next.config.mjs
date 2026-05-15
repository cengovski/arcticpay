/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@solana/web3.js",
    "@solana/spl-token",
  ],
};

export default nextConfig;
