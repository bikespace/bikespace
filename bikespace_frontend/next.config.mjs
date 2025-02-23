// import withMDX from '@next/mdx';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

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
    BIKESPACE_API_URL_DASHBOARD: process.env.BIKESPACE_API_URL_DASHBOARD,
    MAPTILER_API_KEY: 'v29NffFdvlIBsBR5bmoQ',
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
