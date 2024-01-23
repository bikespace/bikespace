import * as React from 'react';
import {graphql, PageProps, navigate, HeadProps} from 'gatsby';
import {button, title, logo, main, mainContent} from '../styles/index.css';
import {StaticImage} from 'gatsby-plugin-image';

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

const IndexRoute = ({data: {site}}: PageProps<DataProps>) => {
  return (
    <main className={main}>
      <header>
        <nav className={'main-nav'} aria-label="Main">
          <ul>
            <li>
              <a href="https://bikespace.ca/">About BikeSpace</a>
            </li>
            <li>
              <a href="https://dashboard.bikespace.ca/">Explore the Data</a>
            </li>
            <li>
              <a href="https://github.com/bikespace/bikespace/tree/main/bikespace_frontend">
                <StaticImage
                  height={20}
                  style={{marginRight: '0.3rem'}}
                  id="github-logo"
                  src="../images/github-mark-white.svg"
                  alt="Github Logo"
                />
                Contribute
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <div className={mainContent}>
        <h1 className={title}>{site.siteMetadata.title}</h1>
        <StaticImage
          className={logo}
          src="../images/bikespace-logo.svg"
          alt="BikeSpace Logo"
        />
        <button
          className={button}
          onClick={() => {
            navigate('/submission');
          }}
        >
          Report a parking issue
        </button>
      </div>
    </main>
  );
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
