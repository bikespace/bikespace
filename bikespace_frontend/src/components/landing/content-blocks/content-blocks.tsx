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
          <a className={styles.buttonLink}>Button One</a>
          <a className={styles.buttonLink}>Button Two</a>
          <a className={styles.buttonLink}>Button Three</a>
        </div>
        <div style={{flex: '1 1 auto'}}>
          <img src={imageSrc} className={styles.heroImage}></img>
        </div>
      </div>
    </div>
  );
}

export {HeroBlock};
