import React, {useState, useEffect, useCallback} from 'react';

import {ParkingDuration} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useStore} from '@/states/store';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';

import styles from './filter-parking-duration.module.scss';

enum DurationCategory {
  Short = 'short',
  Long = 'long',
}

export function FilterParkingDuration() {
  const {parkingDuration, setFilters} = useStore(state => ({
    parkingDuration: state.filters.parkingDuration,
    setFilters: state.setFilters,
  }));

  const [durationCategory, setDurationCategory] =
    useState<DurationCategory | null>(null);

  useEffect(() => {
    switch (durationCategory) {
      case DurationCategory.Short:
        setFilters({
          parkingDuration: [ParkingDuration.Minutes, ParkingDuration.Hours],
        });
        break;
      case DurationCategory.Long:
        setFilters({
          parkingDuration: [
            ParkingDuration.Overnight,
            ParkingDuration.MultiDay,
          ],
        });
        break;
      default:
        return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationCategory]);

  useEffect(() => {
    if (parkingDuration.length === 0) return;

    trackUmamiEvent(
      'parkingdurationfilter',
      Object.values(ParkingDuration).reduce(
        (acc, next) => ({
          ...acc,
          [next]: parkingDuration.includes(next),
        }),
        {}
      )
    );
  }, [parkingDuration]);

  const handleChange = useCallback(
    (value: ParkingDuration) => {
      setFilters({
        parkingDuration: parkingDuration?.includes(value)
          ? parkingDuration.filter(v => v !== value)
          : [...(parkingDuration || []), value],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parkingDuration]
  );

  return (
    <SidebarDetailsDisclosure open>
      <summary>Parking Duration</summary>
      <SidebarDetailsContent>
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
            <div key={value} className={styles.durationCheckbox}>
              <input
                type="checkbox"
                id={`filter-parking-duration-${value}`}
                name={value}
                className="filter-parking-duration-input"
                checked={parkingDuration?.includes(value)}
                onChange={() => {
                  handleChange(value);
                }}
              />
              <label htmlFor={`filter-parking-duration-${value}`}>
                {label}
              </label>
            </div>
          ))}
        </div>
      </SidebarDetailsContent>
    </SidebarDetailsDisclosure>
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
