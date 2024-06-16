import React, {useState} from 'react';
import {Link} from 'gatsby';
import {useClickAway} from '@uidotdev/usehooks';

import * as styles from './page-header.module.scss';

import hamburgerMenu from '@/assets/icons/hamburger-menu.svg';
import bikespaceLogo from '@/assets/icons/bikespace_wordmark.png';
import githubLogo from '@/assets/icons/github-mark.svg';

export function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const clickAwayRef = useClickAway(() => {
    setIsMenuOpen(false);
  }) as React.RefObject<HTMLDivElement>;

  return (
    <header className={styles.header}>
      <Link to="/" title="Home" className={styles.bikespaceLogo}>
        <img src={bikespaceLogo} alt="BikeSpace logo" />
      </Link>
      <div
        role="button"
        className={styles.navToggle}
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
        }}
        ref={clickAwayRef}
      >
        <img src={hamburgerMenu} alt="Menu icon" />
      </div>
      <nav
        className={`${styles.mainNav} ${isMenuOpen ? styles.open : ''}`}
        aria-label="Main"
      >
        <ul>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="https://github.com/bikespace/bikespace/tree/main/">
              <img src={githubLogo} alt="GitHub Logo" id="github-logo" />
              Contribute
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
