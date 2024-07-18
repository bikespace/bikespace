import React from 'react';

import {Header} from '../header';

import styles from './page-template.module.scss';

type PageTemplateProps = {
  markdownRemark: {
    frontmatter: {
      slug: string;
      title: string;
    };
    html: string;
  };
};

export function LandingPage({
  data, // this prop will be injected by the GraphQL query below.
}: {
  data: PageTemplateProps;
}) {
  const {markdownRemark} = data; // data.markdownRemark holds your post data
  const {html} = markdownRemark;
  return (
    <>
      <Header />
      <main className={styles.pageMain}>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </main>
      <footer className={styles.pageFooter}>This will be a footer</footer>
    </>
  );
}
