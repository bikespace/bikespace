'use client';

import React, {useState} from 'react';
import {Route} from 'next';
import Link from 'next/link';
import {useClickAway} from '@uidotdev/usehooks';

import styles from './dashboard-header.module.scss';

import hamburgerMenu from '@/assets/icons/hamburger-menu.svg';
import closeMenu from '@/assets/icons/close-menu.svg';
import bikespaceLogo from '@/assets/icons/bikespace_wordmark.png';
import githubLogo from '@/assets/icons/github-mark.svg';
import mailtoIcon from '@/assets/icons/envelope-at.svg';

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const clickAwayRef = useClickAway(() => {
    setIsMenuOpen(false);
  }) as React.RefObject<HTMLDivElement>;

  return (
    <header
      className={`${styles.header} ${isMenuOpen ? styles.headerOpen : styles.headerClosed}`}
      ref={clickAwayRef}
    >
      <button
        className={styles.navToggle}
        tabIndex={0}
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
        }}
        aria-label={
          isMenuOpen ? 'Hide Navigation Menu' : 'Show Navigation Menu'
        }
        aria-expanded={isMenuOpen ? 'true' : 'false'}
      >
        {isMenuOpen ? (
          <img src={closeMenu.src} alt="" height={24} />
        ) : (
          <img src={hamburgerMenu.src} alt="" />
        )}
      </button>
      <nav className={styles.mainNav} aria-label="Main">
        <Link href={'/' as Route} title="Home" className={styles.bikespaceLogo}>
          <img src={bikespaceLogo.src} alt="" />
        </Link>
        <ul>
          <li>
            <Link href="/submission">Report Bike Parking Issue</Link>
          </li>
          <li>
            <a href="/about">About BikeSpace</a>
          </li>
          <li>
            <a
              href="https://github.com/bikespace/bikespace/tree/main/bikespace_frontend"
              data-umami-event="outbound-github"
            >
              <img src={githubLogo.src} alt="GitHub Logo" id="github-logo" />
              Contribute
            </a>
          </li>
          <li>
            <a
              href={`mailto:${feedbackTo}?subject=${encodeURIComponent(
                feedbackSubject
              )}&body=${encodeURIComponent(feedbackBody)}`}
              data-umami-event="mailto-feedback"
              id="mailto-feedback"
            >
              <img src={mailtoIcon.src} alt="Email Icon" />
              Feedback
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

const feedbackTo = 'bikespaceto@gmail.com';
const feedbackSubject = 'BikeSpace Dashboard Feedback';
const feedbackBody = `----------
Please describe your feedback about the bikespace.ca dashboard below. We welcome both positive feedback (e.g. I found x feature useful) and constructive feedback (e.g. y is broken, I wish the dashboard did z).

Especially for constructive feedback, you can help us by letting us know:
- Your browser and platform (e.g. Safari, iPhone)
- If it's a bug, what steps led to the problem
- If it's something you wish the dashboard was able to do, what goal would that feature help you accomplish? (e.g. "I wanted to see only issues along street x", or "I wanted to better understand issues of y type")

Thank you for taking the time to help us make the dashboard better!
----------

Hi BikeSpace team,

`;
