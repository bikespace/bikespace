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

  const todayDate = DateTime.local().toISODate();

  const form = useForm<CustomDateRangeSchema>({
    resolver: customDateRangeSchemaResolver,
    mode: 'onChange',
  });

  const onSubmit = (data: CustomDateRangeSchema) => {
    setFilters({
      dateRange: {
        from: DateTime.fromJSDate(data.from).toUTC().toJSDate(),
        to: DateTime.fromJSDate(data.to).endOf('day').toUTC().toJSDate(),
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
          {...form.register('from', {
            setValueAs: (v: string) =>
              v ? new Date(`${v}T00:00:00`) : undefined,
          })}
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
          {...form.register('to', {
            setValueAs: (v: string) =>
              v ? new Date(`${v}T00:00:00`) : undefined,
          })}
          defaultValue={todayDate}
        />
      </div>
      <SidebarButton type="submit" disabled={!form.formState.isValid}>
        Apply
      </SidebarButton>
    </form>
  );
}
