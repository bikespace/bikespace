import {DateTime, Interval} from 'luxon';

import {DateRangeInterval} from '@/interfaces/Submission';

export const getDateRangeFromInterval = (interval: DateRangeInterval) => {
  const now = new Date();
  const dtNow = DateTime.fromJSDate(new Date());

  switch (interval) {
    case DateRangeInterval.AllDates:
      return null;
    case DateRangeInterval.Last7Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 7}),
          dtNow
        ).start!.toJSDate(),
        to: now,
      };
    case DateRangeInterval.Last30Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 30}),
          now
        ).start!.toJSDate(),
        to: now,
      };
    case DateRangeInterval.Last90Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 90}),
          now
        ).start!.toJSDate(),
        to: now,
      };
    case DateRangeInterval.Last12Months:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({months: 12}).startOf('month'),
          dtNow.endOf('month')
        ).start!.toJSDate(),
        to: now,
      };
    case DateRangeInterval.ThisYear:
      return {
        from: Interval.fromDateTimes(
          dtNow.startOf('year'),
          dtNow.endOf('year')
        ).start!.toJSDate(),
        to: now,
      };
    case DateRangeInterval.LastYear:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({years: 1}).startOf('year'),
          dtNow.minus({years: 1}).endOf('year')
        ).start!.toJSDate(),
        to: now,
      };
    default:
      return null;
  }
};
