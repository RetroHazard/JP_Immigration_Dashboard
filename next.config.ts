import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
};

module.exports = nextConfig;

export default nextConfig;
