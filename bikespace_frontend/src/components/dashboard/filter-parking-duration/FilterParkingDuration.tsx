import React, {useState} from 'react';

import {FilterSection} from '../filter-section';
import {SidebarButton} from '../sidebar-button';

import * as styles from './filter-parking-duration.module.scss';

enum DurationCategory {
  Short = 'short',
  Long = 'long',
}

export function FilterParkingDuration() {
  const [durationCategory, setDurationCategory] =
    useState<DurationCategory | null>(null);

  return (
    <FilterSection title="Parking Duration">
      <div className={styles.categoryButtons}>
        {durationButtons.map(({label, value}) => (
          <SidebarButton
            key={value}
            onClick={() => {
              setDurationCategory(prev => (prev === value ? null : value));
            }}
          >
            {label}
          </SidebarButton>
        ))}
      </div>
    </FilterSection>
  );
}

const durationButtons = [
  {
    value: DurationCategory.Short,
    label: 'Short-Term',
  },
  {
    value: DurationCategory.Long,
    label: 'Long-Term',
  },
];
