import React from 'react';

import styles from './filter-section.module.scss';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FilterSection({title, children}: FilterSectionProps) {
  return (
    <details className={styles.filterSection} open>
      <summary>{title}</summary>
      <section className={styles.sectionContent}>{children}</section>
    </details>
  );
}
