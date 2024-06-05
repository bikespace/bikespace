import React, {useState} from 'react';

import {FeedbackLink} from '../feedback-link/FeedbackLink';

import * as styles from './dashboard-header.module.scss';

import hamburgerMenu from '@/images/hamburger-menu.svg';
import bikespaceLogo from '@/images/bikespace_wordmark.png';
import githubLogo from '@/images/github-mark.svg';

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <header className={styles.header}>
      <div
        role="button"
        className={styles.navToggle}
        onClick={() => {
          setIsMenuOpen(true);
        }}
      >
        <img src={hamburgerMenu} alt="Menu icon" />
      </div>
      <nav
        className={`${styles.mainNav} ${isMenuOpen ? styles.open : ''}`}
        aria-label="Main"
      >
        <a href="#" title="Dashboard Home" className={styles.bikespaceLogo}>
          <img src={bikespaceLogo} alt="BikeSpace logo" />
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
              <img src={githubLogo} alt="GitHub Logo" id="github-logo" />
              Contribute
            </a>
          </li>
          <li>
            <FeedbackLink />
          </li>
        </ul>
      </nav>
      <div
        className={`${styles.navBackdrop} ${isMenuOpen ? styles.open : ''}`}
        role="button"
        aria-roledescription="Dismiss Navigation Menu"
        onClick={() => {
          setIsMenuOpen(false);
        }}
      />
    </header>
  );
}
