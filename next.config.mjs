/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // middleware: true, // Removed this line as it's not a valid Next.js config option
                  // Standard middleware is configured via a middleware.ts/js file in the root or src.
  eslint: {
    ignoreDuringBuilds: true, // Added from hospital-portal
  },
  typescript: {
    ignoreBuildErrors: true, // Added from hospital-portal
  },
  images: {
    unoptimized: true, // Added from hospital-portal
  },
};

export default nextConfig; 