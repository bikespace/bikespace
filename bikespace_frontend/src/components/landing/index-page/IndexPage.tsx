import React from 'react';
import {Link} from 'gatsby';

import bikespaceLogo from '@/assets/icons/bikespace-logo.svg';
import githubLogo from '@/assets/icons/github-mark-white.svg';

import * as styles from './index-page.module.scss';

interface IndexPageProps {
  title: string;
}

export function IndexPage({title}: IndexPageProps) {
  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>{title}</h1>
        <img className={styles.logo} src={bikespaceLogo} alt="BikeSpace Logo" />
        <Link
          className={styles.button}
          to="/submission"
          data-umami-event="report-parking-issue-button"
        >
          Report a parking issue
        </Link>
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
                <img
                  height={20}
                  style={{marginRight: '0.3rem'}}
                  id="github-logo"
                  src={githubLogo}
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
