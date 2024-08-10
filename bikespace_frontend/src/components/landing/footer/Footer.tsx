import React from 'react';

import styles from './footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.pageFooter}>
      <div className={styles.footerContent}>
        <div>
          <a
            href="mailto:bikespaceto@gmail.com"
            className={styles.footerLink}
            data-umami-event="mailto-contact-us"
          >
            Contact Us
          </a>
        </div>
        <div>© BikeSpace</div>
        <div>
          <a
            href="https://bikespacetoblog.wordpress.com/"
            data-umami-event="outbound-wordpress"
            className={styles.footerLink}
          >
            Our Blog
          </a>
        </div>
      </div>
    </footer>
  );
}
