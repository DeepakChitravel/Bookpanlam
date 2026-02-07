/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "booking-api.kelvipetti.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
