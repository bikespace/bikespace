import {graphql} from 'gatsby';

import {PageTemplate} from '@/components/md-page';

export default PageTemplate;

export const pageQuery = graphql`
  query ($id: String!) {
    markdownRemark(id: {eq: $id}) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`;
