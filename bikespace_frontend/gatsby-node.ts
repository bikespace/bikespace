import type {CreateWebpackConfigArgs} from 'gatsby';
import path from 'path';

export const onCreateWebpackConfig = ({actions}: CreateWebpackConfigArgs) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
  });
};
