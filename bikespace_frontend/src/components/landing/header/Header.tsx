import React, {useState} from 'react';
import {Route} from 'next';
import Link from 'next/link';
import {useClickAway} from '@uidotdev/usehooks';

import styles from './header.module.scss';

import hamburgerMenu from '@/assets/icons/hamburger-menu.svg';
import bikespaceLogo from '@/assets/icons/bikespace_wordmark.png';
import githubLogo from '@/assets/icons/github-mark.svg';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const clickAwayRef = useClickAway(() => {
    setIsMenuOpen(false);
  }) as React.RefObject<HTMLDivElement>;

  return (
    <header className={styles.header} ref={clickAwayRef}>
      <div className={styles.headerContent}>
        <Link
          href={'/' as Route}
          title="App Home"
          className={styles.bikespaceLogo}
        >
          <img src={bikespaceLogo.src} alt="BikeSpace logo" />
        </Link>
        <div
          role="button"
          className={styles.navToggle}
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <img src={hamburgerMenu.src} alt="Menu" />
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
                <img src={githubLogo.src} alt="GitHub" />
                Contribute
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
