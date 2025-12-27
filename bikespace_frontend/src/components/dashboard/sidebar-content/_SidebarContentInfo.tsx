import React from 'react';

import {SidebarLinkButton} from '@/components/shared-ui/sidebar-button';

import styles from './_SidebarContent.module.scss';

import issueReporter from '@/assets/images/issue-reporter.svg';
import dataGuide from '@/assets/images/data-guide.svg';

export function SidebarContentInfo() {
  return (
    <>
      <div className={styles.ContentCard}>
        <h2 className={styles.cardHeading}>About the Dashboard</h2>
        <p>
          The BikeSpace Dashboard is based on issues reported through the
          publicly accessible BikeSpace Issue Reporting web app.
        </p>
        <p>
          Launched in July 2018, BikeSpace allows cyclists to self-report bike
          parking concerns they come across in the Toronto, Canada area.
        </p>
        <div className={styles.bordered}>
          <img width="156" src={issueReporter.src} />
          <SidebarLinkButton href="/submission">
            Try BikeSpace Issue Reporter
          </SidebarLinkButton>
        </div>
      </div>
      <div className={styles.ContentCard}>
        <h2 className={styles.cardHeading}>Data Guide</h2>
        <p>
          Check out our data guide to learn more about the BikeSpace bike
          parking submission data schema.
        </p>
        <div className={styles.bordered}>
          <img width="156" src={dataGuide.src} />
          <SidebarLinkButton href="/BikeSpace Dashboard Dataset Details.pdf">
            View Data Guide PDF
          </SidebarLinkButton>
        </div>
      </div>
    </>
  );
}
