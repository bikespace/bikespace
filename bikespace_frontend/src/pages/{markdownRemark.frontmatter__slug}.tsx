import * as React from 'react';
import {graphql} from 'gatsby';

import {PageHeader} from '@/components/md-page/page-header/PageHeader';

import * as styles from '@/components/md-page/page.module.scss';

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
  const {html} = markdownRemark;
  return (
    <>
      <PageHeader />
      <main className={styles.pageMain}>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </main>
      <footer className={styles.pageFooter}>This will be a footer</footer>
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
