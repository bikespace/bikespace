import * as React from 'react';
import {graphql} from 'gatsby';

type PageData = {
  markdownRemark: {
    frontmatter: {
      slug: string;
      title: string;
    };
    html: string;
  };
};

export default function PageTemplate({
  data, // this prop will be injected by the GraphQL query below.
}: {
  data: PageData;
}) {
  const {markdownRemark} = data; // data.markdownRemark holds your post data
  const {frontmatter, html} = markdownRemark;
  return (
    <>
      <nav>
        This will be a navbar (it will be at the top when it's styled correctly)
      </nav>
      <main>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </main>
      <footer>This will be a footer</footer>
    </>
  );
}

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
