/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript errors fail the build (intentionally strict).
  // ESLint is skipped at build time: eslint 8 config is incompatible with
  // Next 15.5's lint runner. Run `npm run lint` locally instead.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
