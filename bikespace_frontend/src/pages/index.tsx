import * as React from 'react';
import {graphql, PageProps, HeadProps} from 'gatsby';

import {IndexPage} from '@/components/landing';

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

const IndexRoute = ({data: {site}}: PageProps<DataProps>) => {
  return <IndexPage title={site.siteMetadata.title} />;
};

export default IndexRoute;

export function Head(props: HeadProps<DataProps>) {
  return <title>{props.data.site.siteMetadata.title}</title>;
}

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
