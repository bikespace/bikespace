import {useForm} from 'react-hook-form';
import {DateTime} from 'luxon';

import {CustomDateRangeSchema, customDateRangeSchemaResolver} from './schema';

import {DateRangeInterval} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useStore} from '@/states/store';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';

import styles from './filter-date-range-custom.module.scss';

export function FilterDateRangeCustom() {
  const {setFilters} = useStore(state => ({
    setFilters: state.setFilters,
  }));

  const today = new Date();
  const todayDate = today.toISOString().substring(0, 10);

  const form = useForm<CustomDateRangeSchema>({
    resolver: customDateRangeSchemaResolver,
    mode: 'onChange',
  });

  /**
   * Note: the intended behaviour is for the date specified to be interpreted in the User's timezone. react-hook-form provides dates in the UTC timezone, so .setZone() below is used to adjust the date to 'local'.
   */
  const onSubmit = (data: CustomDateRangeSchema) => {
    setFilters({
      dateRange: {
        from: DateTime.fromJSDate(data.from)
          .setZone('local')
          .startOf('day')
          .toJSDate(),
        to: DateTime.fromJSDate(data.to)
          .setZone('local')
          .endOf('day')
          .toJSDate(),
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });

    trackUmamiEvent('datefilter', {
      from: data.from ?? '',
      to: data.to ?? '',
      interval: DateRangeInterval.CustomRange,
    });
  };

  return (
    <form
      className={styles.dateRangeCustom}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.from && (
        <p className={styles.errorMessages}>
          {form.formState.errors.from.message}
        </p>
      )}
      <div className={styles.dateInput}>
        <label htmlFor="filter-start-date">Start date:</label>
        <input
          type="date"
          id="filter-start-date"
          {...form.register('from', {valueAsDate: true})}
          defaultValue={todayDate}
        />
      </div>
      {form.formState.errors.to && (
        <p className={styles.errorMessages}>
          {form.formState.errors.to.message}
        </p>
      )}
      <div className={styles.dateInput}>
        <label htmlFor="filter-end-date">End date:</label>
        <input
          type="date"
          id="filter-end-date"
          {...form.register('to', {valueAsDate: true})}
          defaultValue={todayDate}
        />
      </div>
      <SidebarButton type="submit" disabled={!form.formState.isValid}>
        Apply
      </SidebarButton>
    </form>
  );
}
