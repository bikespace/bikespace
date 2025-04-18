import React from 'react';

import issueReporter from '@/assets/images/issue-reporter.png';
import dataGuide from '@/assets/images/data-guide.png';

import styles from './_SidebarContent.module.scss';
import {SidebarLinkButton} from '../sidebar-button';

const content = {
  lastUpdated: 'Data Last Updated',
  about: 'About the Dashboard',
  aboutContent:
    'The BikeSpace Dashboard is based on issues reported through the publicly accessible Bikespace Issue Reporting web app.\nLaunched in July 2018, BikeSpace allows cyclists to self-report bike parking concerns they come across in the Toronto, Canada area.',
  try: 'Try Bikespace Issue Reporter',
  dataGuide: 'Data Guide',
  dataGuideContent:
    'Check out our data guide to learn more about the Bikespace bike parking submission data schema.',
  view: 'View Data Guide PDF',
};

export function SidebarContentInfo() {
  return (
    <>
      <div className={styles.ContentCard}>
        <h2 className={styles.cardHeading}>{content.about}</h2>
        <p>{content.aboutContent}</p>
        <div className={styles.bordered}>
          <img width={issueReporter.width / 2} src={issueReporter.src} />
          <SidebarLinkButton href="/submission">
            {content.try}
          </SidebarLinkButton>
        </div>
      </div>
      <div className={styles.ContentCard}>
        <h2 className={styles.cardHeading}>{content.dataGuide}</h2>
        <p>{content.dataGuideContent}</p>
        <div className={styles.bordered}>
          <img width={dataGuide.width / 2} src={dataGuide.src} />
          <SidebarLinkButton>{content.view}</SidebarLinkButton>
        </div>
      </div>
    </>
  );
}
