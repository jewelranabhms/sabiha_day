/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The dev preview is served through a proxied host — allow it explicitly.
  allowedDevOrigins: ['*.e2b.app', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
