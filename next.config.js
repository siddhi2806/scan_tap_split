/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 14
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Uncomment and replace 'your-repo-name' with your actual repository name
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/',
};

module.exports = nextConfig;
