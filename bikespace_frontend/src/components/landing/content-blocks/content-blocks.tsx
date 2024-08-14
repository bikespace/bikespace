import React from 'react';

import styles from './content-blocks.module.scss';

function HeroBlock({
  tagline,
  imageSrc,
}: Readonly<{
  tagline: string;
  imageSrc: string;
}>) {
  return (
    <div className={styles.fullWidth}>
      <div className={styles.heroBlock}>
        <div style={{flex: '2 1 400px'}}>
          <div className={styles.heroTagline}>{tagline}</div>
          <div className={styles.heroButtonContainer}>
            <a
              href="/"
              className={`${styles.buttonLink} ${styles.buttonFilled}`}
            >
              Find bike parking
            </a>
            <a
              href="/submission"
              className={styles.buttonLink}
              data-umami-event="submission-from-frontpage"
            >
              Report a bike parking issue
            </a>
            <a
              href="/dashboard"
              className={styles.navLink}
              data-umami-event="dashboard-from-frontpage"
            >
              View the collected data
            </a>
          </div>
        </div>
        <div style={{flex: '1 1 auto'}}>
          <img src={imageSrc} className={styles.heroImage}></img>
        </div>
      </div>
    </div>
  );
}

function DividerImg({
  imageSrc,
  imageAlt,
}: Readonly<{
  imageSrc: string;
  imageAlt: string;
}>) {
  return (
    <div style={{textAlign: 'center'}}>
      <img
        src={imageSrc}
        alt={imageAlt}
        title={imageAlt}
        style={{height: '3rem', width: 'auto'}}
      ></img>
    </div>
  );
}

export {HeroBlock, DividerImg};
