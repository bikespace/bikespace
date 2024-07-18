import React, {useState, useEffect, useContext} from 'react';

import {SubmissionFiltersContext} from '../context';

import {ParkingDuration} from '@/interfaces/Submission';

import {FilterSection} from '../filter-section';
import {SidebarButton} from '../sidebar-button';

import styles from './filter-parking-duration.module.scss';

enum DurationCategory {
  Short = 'short',
  Long = 'long',
}

export function FilterParkingDuration() {
  const {filters, setFilters} = useContext(SubmissionFiltersContext);

  const [durationCategory, setDurationCategory] =
    useState<DurationCategory | null>(null);

  useEffect(() => {
    switch (durationCategory) {
      case DurationCategory.Short:
        setFilters(prev => ({
          ...prev,
          parkingDuration: [ParkingDuration.Minutes, ParkingDuration.Hours],
        }));
        break;
      case DurationCategory.Long:
        setFilters(prev => ({
          ...prev,
          parkingDuration: [
            ParkingDuration.Overnight,
            ParkingDuration.MultiDay,
          ],
        }));
        break;
      default:
        return;
    }
  }, [durationCategory]);

  return (
    <FilterSection title="Parking Duration">
      <div className={styles.categoryButtons}>
        {durationButtons.map(({label, value}) => (
          <SidebarButton
            key={value}
            onClick={() => {
              setDurationCategory(value);
            }}
          >
            {label}
          </SidebarButton>
        ))}
      </div>
      <div className={styles.durationCheckboxes}>
        {durationCheckboxes.map(({label, value}) => (
          <div key={value}>
            <input
              type="checkbox"
              id={`filter-parking-duration-${value}`}
              name={value}
              className="filter-parking-duration-input"
              checked={filters.parkingDuration?.includes(value)}
              onChange={() => {
                setFilters(prev => ({
                  ...prev,
                  parkingDuration: prev.parkingDuration?.includes(value)
                    ? prev.parkingDuration.filter(v => v !== value)
                    : [...(prev.parkingDuration || []), value],
                }));
              }}
            />
            <label htmlFor={`filter-parking-duration-${value}`}>{label}</label>
          </div>
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

const durationCheckboxes = [
  {
    value: ParkingDuration.Minutes,
    label: 'less than an hour',
  },
  {
    value: ParkingDuration.Hours,
    label: 'several hours',
  },
  {
    value: ParkingDuration.Overnight,
    label: 'overnight',
  },
  {
    value: ParkingDuration.MultiDay,
    label: 'several days',
  },
];
