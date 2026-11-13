import createMDX from '@next/mdx';

const nextConfig = {
  // Enable SSG
  output: 'export',
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  typedRoutes: true,
  env: {
    DATA_BICYCLE_THEFT: process.env.DATA_BICYCLE_THEFT,
    BIKESPACE_API_URL: process.env.BIKESPACE_API_URL,
    MAPTILER_API_KEY: process.env.MAPTILER_API_KEY,
    DATA_BICYCLE_PARKING: process.env.DATA_BICYCLE_PARKING,
    DATA_BICYCLE_NETWORK: process.env.DATA_BICYCLE_NETWORK,
    DATA_LEVEL_OF_TRAFFIC_STRESS: process.env.DATA_LEVEL_OF_TRAFFIC_STRESS,
  },
  transpilePackages: ['nuqs'],
};

const withMDX = createMDX({
  options: {
    // Plugins are referenced by package name so the options stay serializable,
    // which Turbopack requires.
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
});

export default withMDX(nextConfig);
