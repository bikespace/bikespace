// import withMDX from '@next/mdx';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

const nextConfig = {
  // Enable SSG
  output: 'export',
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    BIKESPACE_API_URL: process.env.BIKESPACE_API_URL,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

export default withMDX(nextConfig);
