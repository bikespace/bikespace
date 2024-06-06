import * as React from 'react';
import {graphql, PageProps, navigate, HeadProps} from 'gatsby';
import {
  button,
  title,
  logo,
  main,
  mainContent,
  footerNav,
} from '../styles/index.css';
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
      <div className={mainContent}>
        <h1 className={title}>{site.siteMetadata.title}</h1>
        <StaticImage
          className={logo}
          src="../images/bikespace-logo.svg"
          alt="BikeSpace Logo"
          objectFit="contain"
        />
        <button
          className={button}
          onClick={() => {
            navigate('/submission');
          }}
          data-umami-event="report-parking-issue-button"
        >
          Report a parking issue
        </button>
      </div>

      <footer>
        <nav className={footerNav} aria-label="Main">
          <ul>
            <li>
              <a
                href="https://bikespace.ca/"
                data-umami-event="footer-about-us"
              >
                About BikeSpace
              </a>
            </li>
            <li>
              <a
                href="https://dashboard.bikespace.ca/"
                data-umami-event="footer-outbound-bikespace-dashboard"
              >
                Explore the Data
              </a>
            </li>
            <li>
              <a
                href="https://github.com/bikespace/bikespace/tree/main/bikespace_frontend"
                data-umami-event="footer-outbound-bikespace-github"
              >
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
      </footer>
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
