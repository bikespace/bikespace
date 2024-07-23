import withMDX from '@next/mdx';

const nextConfig = withMDX()({
  distDir: 'build',
  // Enable SSG
  output: 'export',
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
  },
});

export default nextConfig;
