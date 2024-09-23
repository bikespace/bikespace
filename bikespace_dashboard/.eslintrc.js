const baseConfig = require('gts/.eslintrc.json');

const notNode = name => !name.includes('node');

module.exports = {
  ...baseConfig,
  env: {
    browser: true,
    node: false,
    es6: true,
  },
  extends: baseConfig.extends.filter(notNode),
  plugins: baseConfig.plugins.filter(notNode),
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  globals: {
    ...baseConfig.globals,
    // jquery
    $: true,
    // leaflet
    L: true,
    Plotly: true,
    umami: true,
  },

  overrides: [
    {
      files: ['./.eslintrc.js', './.prettierrc.js'],
      env: {node: true},
      parserOptions: {sourceType: 'commonjs'},
    },
  ],
};
