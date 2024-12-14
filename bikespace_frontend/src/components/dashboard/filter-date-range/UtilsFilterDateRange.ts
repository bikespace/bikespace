import {DateTime, Interval} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

/**
 * Note that "last x" intervals include the last x - 1 units of time plus the current unit of time, which may be incomplete. E.g. "last 7 days" includes today (partial) plus the last six days, and "last 12 months" includes this month (partial) plus the last 11 months.
 */
export const getDateRangeFromInterval = (interval: DateRangeInterval) => {
  const dtNow = DateTime.fromJSDate(new Date());

  switch (interval) {
    case DateRangeInterval.AllDates:
      return null;
    case DateRangeInterval.Last7Days:
      return {
        from: dtNow
          .minus({days: 7 - 1})
          .startOf('day')
          .toJSDate(),
        to: dtNow.endOf('day').toJSDate(),
      };
    case DateRangeInterval.Last30Days:
      return {
        from: dtNow
          .minus({days: 30 - 1})
          .startOf('day')
          .toJSDate(),
        to: dtNow.endOf('day').toJSDate(),
      };
    case DateRangeInterval.Last90Days:
      return {
        from: dtNow
          .minus({days: 90 - 1})
          .startOf('day')
          .toJSDate(),
        to: dtNow.endOf('day').toJSDate(),
      };
    case DateRangeInterval.Last12Months:
      return {
        from: dtNow
          .minus({months: 12 - 1})
          .startOf('month')
          .toJSDate(),
        to: dtNow.endOf('month').toJSDate(),
      };
    case DateRangeInterval.ThisYear:
      return {
        from: dtNow.startOf('year').toJSDate(),
        to: dtNow.endOf('year').toJSDate(),
      };
    case DateRangeInterval.LastYear:
      return {
        from: dtNow.minus({years: 1}).startOf('year').toJSDate(),
        to: dtNow.minus({years: 1}).endOf('year').toJSDate(),
      };
    default:
      return null;
  }
};
