import React from 'react';
import {HeadProps, graphql} from 'gatsby';

import {SubmissionPage} from '@/components/submission';

const SubmissionRoute = () => {
  return <SubmissionPage />;
};

export default SubmissionRoute;

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

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
