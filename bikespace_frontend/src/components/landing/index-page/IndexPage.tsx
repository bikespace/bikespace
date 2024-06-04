import React from 'react';
import {navigate} from 'gatsby';
import {StaticImage} from 'gatsby-plugin-image';

import * as styles from './index-page.module.scss';

interface IndexPageProps {
  title: string;
}

export function IndexPage({title}: IndexPageProps) {
  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>{title}</h1>
        <StaticImage
          className={styles.logo}
          src="../../../images/bikespace-logo.svg"
          alt="BikeSpace Logo"
          objectFit="contain"
        />
        <button
          className={styles.button}
          onClick={() => {
            navigate('/submission');
          }}
          data-umami-event="report-parking-issue-button"
        >
          Report a parking issue
        </button>
      </div>

      <footer>
        <nav className={styles.footerNav} aria-label="Main">
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
                  src="../../../images/github-mark-white.svg"
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
}
