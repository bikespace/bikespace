import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

import {FeedbackLink} from '../feedback-link/FeedbackLink';

import * as styles from './dashboard-header.module.scss';

export function DashboardHeader() {
  return (
    <header className={styles.header}>
      <a href="#" className={styles.navToggle}>
        <StaticImage src="../../../images/hamburger-menu.svg" alt="Menu icon" />
      </a>
      <nav className={styles.mainNav} aria-label="Main">
        <a href="#" title="Dashboard Home" className={styles.bikespaceLogo}>
          <StaticImage
            src="../../../images/bikespace_wordmark.png"
            alt="BikeSpace logo"
          />
        </a>
        <ul>
          <li>
            <a
              href="https://app.bikespace.ca/submission/"
              data-umami-event="outbound-app"
            >
              Report Bike Parking Issue
            </a>
          </li>
          <li>
            <a
              href="https://bikespace.ca/"
              data-umami-event="outbound-landing-page"
            >
              About BikeSpace
            </a>
          </li>
          <li>
            <a
              href="https://github.com/bikespace/bikespace/tree/main/bikespace_dashboard"
              data-umami-event="outbound-github"
            >
              <StaticImage
                src="../../../images/github-mark.svg"
                alt="GitHub Logo"
                id="github-logo"
              />
              Contribute
            </a>
          </li>
          <li>
            <FeedbackLink />
          </li>
        </ul>
      </nav>
      <div
        className={styles.navBackdrop}
        role="button"
        aria-roledescription="Dismiss Navigation Menu"
      ></div>
    </header>
  );
}
