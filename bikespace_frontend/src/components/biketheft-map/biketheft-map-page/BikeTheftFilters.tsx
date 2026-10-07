'use client';
import {SidebarSelect} from '@/components/shared-ui/sidebar-select';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {BikeTheftStatusFilter} from '@/interfaces/BikeTheftProperties';
import styles from './Biketheft-filters.module.scss';

interface BikeTheftFiltersProps {
  statusFilter: BikeTheftStatusFilter;
  latestReportDate: string;
  startDate: string;
  endDate: string;
  locationFilter: string;
  availableLocations: string[];
  reportCount: number;
  onStatusChange: (status: BikeTheftStatusFilter) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onLocationChange: (location: string) => void;
}
export function BikeTheftFilters({
  statusFilter,
  latestReportDate,
  startDate,
  endDate,
  locationFilter,
  availableLocations,
  reportCount,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onLocationChange,
}: BikeTheftFiltersProps) {
  const latestYear = latestReportDate
    ? Number(latestReportDate.slice(0, 4))
    : null;
  const currentYear = new Date().getFullYear();
  const presets = [
    {
      label: 'This year',
      start: `${currentYear}-01-01`,
      end: `${currentYear}-12-31`,
      disabled: false,
    },
    {
      label: 'Last year',
      start: `${currentYear - 1}-01-01`,
      end: `${currentYear - 1}-12-31`,
      disabled: false,
    },
    {
      label: 'Last 3 years',
      start: latestYear ? `${latestYear - 2}-01-01` : '',
      end: latestYear ? `${latestYear}-12-31` : '',
      disabled: latestYear === null,
    },
    {label: 'All Dates', start: '', end: '', disabled: false},
  ];
  return (
    <div className={styles.filters}>
      {/* Status */}
      <p className={styles.sectionLabel}>Status</p>
      <div className={styles.filterButtonRow}>
        {Object.values(BikeTheftStatusFilter).map(s => (
          <SidebarButton
            key={s}
            className={statusFilter === s ? styles.filterButtonActive : ''}
            onClick={() => onStatusChange(s)}
            aria-pressed={statusFilter === s}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </SidebarButton>
        ))}
      </div>

      <p className={styles.sectionLabel}>Date range</p>
      <div
        className={styles.filterButtonRow}
        role="group"
        aria-label="Date range presets"
      >
        {presets.map(preset => {
          const active =
            !preset.disabled &&
            startDate === preset.start &&
            endDate === preset.end;
          return (
            <SidebarButton
              key={preset.label}
              disabled={preset.disabled}
              aria-pressed={active}
              className={active ? styles.filterButtonActive : ''}
              onClick={() => {
                onStartDateChange(preset.start);
                onEndDateChange(preset.end);
              }}
            >
              {preset.label}
            </SidebarButton>
          );
        })}
      </div>
      {latestReportDate && (
        <p className={styles.dateHelp}>
          Latest report date: {latestReportDate.replaceAll('-', '/')}
        </p>
      )}
      <div className={styles.dateFilterRow}>
        <label className={styles.dateFilterLabel}>
          <span>From</span>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            max={endDate || undefined}
            onChange={e => onStartDateChange(e.target.value)}
            aria-invalid={Boolean(startDate && endDate && startDate > endDate)}
            aria-describedby="bike-theft-date-help"
          />
        </label>
        <label className={styles.dateFilterLabel}>
          <span>To</span>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            min={startDate || undefined}
            onChange={e => onEndDateChange(e.target.value)}
            aria-invalid={Boolean(startDate && endDate && startDate > endDate)}
            aria-describedby="bike-theft-date-help"
          />
        </label>
      </div>
      <p id="bike-theft-date-help" className={styles.dateHelp}>
        Both dates are included. Leave either date empty for no limit.
      </p>
      {startDate && endDate && startDate > endDate && (
        <p role="alert">The From date must be on or before the To date.</p>
      )}
      <SidebarButton
        disabled={!startDate && !endDate}
        onClick={() => {
          onStartDateChange('');
          onEndDateChange('');
        }}
      >
        Clear dates
      </SidebarButton>

      {/* Location filter */}
      <p className={styles.sectionLabel}>Property Location</p>
      <label className={styles.locationFilterLabel}>
        <SidebarSelect
          className={styles.filterSelect}
          value={locationFilter}
          onChange={e => onLocationChange(e.target.value)}
          aria-label="Filter by location"
        >
          <option value="all">All</option>
          {availableLocations.map(loc => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </SidebarSelect>
      </label>

      {/* Number of reports */}
      <p className={styles.reportCount}>
        Showing <strong>{reportCount}</strong> report
        {reportCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
