'use client';

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
        <div style={{flex: '2 1 400px', maxWidth: '90vw'}}>
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
    <div style={{textAlign: 'center', margin: '1rem 0'}}>
      <img
        src={imageSrc}
        alt={imageAlt}
        title={imageAlt}
        style={{height: '3rem', width: 'auto', marginBottom: 0}}
      ></img>
    </div>
  );
}

function FeatureBoxWrapper({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className={styles.fullWidth}>
      <div className={styles.featureBoxWrapper}>{children}</div>
    </div>
  );
}

interface FeatureBoxProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  linksTo: string;
}

function FeatureBox({
  title,
  description,
  imageSrc,
  imageAlt,
  linksTo,
}: FeatureBoxProps) {
  return (
    <div className={styles.featureBox}>
      <a href={linksTo} className={styles.featureBoxImage}>
        <img src={imageSrc} alt={imageAlt} />
      </a>
      <a href={linksTo} className={styles.featureBoxTitle}>
        <h3>{title}</h3>
      </a>
      <div className={styles.featureBoxDescription}>
        <p>{description}</p>
      </div>
    </div>
  );
}

function EmailSignUp() {
  return (
    <div className={styles.buttondownContainer}>
      <form
        action="https://buttondown.email/api/emails/embed-subscribe/bikespace"
        method="post"
        target="popupwindow"
        onSubmit={() =>
          window.open('https://buttondown.email/bikespace', 'popupwindow')
        }
        className={styles.buttondownEmbeddableForm}
      >
        <p>
          <strong>Subscribe to the BikeSpace TO Newsletter</strong>
        </p>
        <div className={styles.buttondownInputs}>
          <input
            type="email"
            name="email"
            className={styles.buttondownInputEmail}
            placeholder="Enter your email"
          />
          <input
            type="submit"
            className={styles.buttondownInputSubmit}
            value="SUBSCRIBE"
          />
        </div>
        <p>
          <a
            className={styles.buttondownReferLink}
            href="https://buttondown.email/refer/bikespace"
            target="_blank"
          >
            Powered by Buttondown.
          </a>
        </p>
      </form>
    </div>
  );
}

export {HeroBlock, DividerImg, FeatureBoxWrapper, FeatureBox, EmailSignUp};
