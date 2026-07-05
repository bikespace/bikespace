import React from 'react';

import {IssueFilterMode, IssueType} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useStore} from '@/states/store';

import {SidebarSelect} from '@/components/shared-ui/sidebar-select';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';

import styles from './filter-issue-type.module.scss';

const issueIcons = {
  [IssueType.NotProvided]: notProvidedIcon,
  [IssueType.Damaged]: damagedIcon,
  [IssueType.Abandoned]: abandonedIcon,
  [IssueType.Other]: otherIcon,
  [IssueType.Full]: fullIcon,
};

export function FilterIssueType() {
  const {issues, issueFilterMode, setFilters} = useStore(state => ({
    issues: state.filters.issues,
    issueFilterMode: state.filters.issueFilterMode,
    setFilters: state.setFilters,
  }));

  const handleChipClick = (value: IssueType) => {
    const newIssues = issues.includes(value)
      ? issues.filter(v => v !== value)
      : [...issues, value];

    setFilters({issues: newIssues});

    trackUmamiEvent('issuefilter', {[value]: value});
  };

  return (
    <SidebarDetailsDisclosure open>
      <summary>Issue Type</summary>
      <SidebarDetailsContent>
        <div className={styles.chipContainer}>
          {issueChips.map(({label, value}) => (
            <button
              key={value}
              className={`${styles.chip} ${
                issues.includes(value) ? styles.chipSelected : ''
              }`}
              onClick={() => handleChipClick(value)}
            >
              <img
                src={issueIcons[value].src}
                alt=""
                className={styles.chipIcon}
              />
              {label}
            </button>
          ))}
        </div>
        <div className={styles.filterModeRow}>
          <label htmlFor="issue-filter-mode" className={styles.filterModeLabel}>
            Filter mode
          </label>
          <SidebarSelect
            id="issue-filter-mode"
            value={issueFilterMode}
            disabled={issues.length === 0}
            onChange={e => {
              const newIssueFilterMode = e.target.value as IssueFilterMode;

              setFilters({issueFilterMode: newIssueFilterMode});

              trackUmamiEvent('issuefiltermode', {
                mode: newIssueFilterMode,
              });
            }}
          >
            <option value={IssueFilterMode.Any}>Match any selected</option>
            <option value={IssueFilterMode.All}>Match all selected</option>
            <option value={IssueFilterMode.Exclude}>Exclude selected</option>
          </SidebarSelect>
        </div>
      </SidebarDetailsContent>
    </SidebarDetailsDisclosure>
  );
}

const issueChips = [
  {
    value: IssueType.NotProvided,
    label: 'No nearby parking',
  },
  {
    value: IssueType.Damaged,
    label: 'Parking damaged',
  },
  {
    value: IssueType.Full,
    label: 'Parking full',
  },
  {
    value: IssueType.Abandoned,
    label: 'Abandoned bicycle',
  },
  {
    value: IssueType.Other,
    label: 'Other issue',
  },
];
