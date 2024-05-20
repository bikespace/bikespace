import type {GatsbyConfig} from 'gatsby';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'BikeSpace',
    siteUrl: 'https://app.bikespace.ca',
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  flags: {
    DEV_WEBPACK_CACHE: false,
  },
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'BikeSpace',
        short_name: 'BikeSpace',
        start_url: '/',
        display: 'standalone',
        icon: 'src/images/bikespace_logo_sm.svg',
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './src/images/',
      },
      __key: 'images',
    },
    'gatsby-plugin-vanilla-extract',
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-react-leaflet',
      options: {
        linkStyles: true, // (default: true) Enable/disable loading stylesheets via CDN
      },
    },
    {
      resolve: `gatsby-plugin-umami`,
      options: {
        websiteId: "d56aa43e-3009-4f6d-9975-c82af706c3be",
        srcUrl: "https://us.umami.is/script.js",
        includeInDevelopment: true,
        autoTrack: true,
        respectDoNotTrack: true,
        dataCache: false,
        dataDomains: "app.bikespace.ca",
      },
    },
  ],
};

export default config;
