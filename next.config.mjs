/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "plus.unsplash.com" }
    ]
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "gsap"]
  }
};

export default nextConfig;
