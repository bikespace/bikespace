import {DateTime, Interval} from 'luxon';

import {FixedDateRange} from './types';

export const getDateRangeFromFixedRange = (selectedRange: FixedDateRange) => {
  const now = new Date();
  const dtNow = DateTime.fromJSDate(new Date());

  switch (selectedRange) {
    case FixedDateRange.AllDates:
      return null;
    case FixedDateRange.Last7Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 7}),
          dtNow
        ).start!.toJSDate(),
        to: now,
      };
    case FixedDateRange.Last30Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 30}),
          now
        ).start!.toJSDate(),
        to: now,
      };
    case FixedDateRange.Last90Days:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({days: 90}),
          now
        ).start!.toJSDate(),
        to: now,
      };
    case FixedDateRange.Last12Months:
      return {
        from: Interval.fromDateTimes(
          dtNow.minus({months: 12}).startOf('month'),
          dtNow.endOf('month')
        ).start!.toJSDate(),
        to: now,
      };
    case FixedDateRange.ThisYear:
      return {
        from: Interval.fromDateTimes(
          dtNow.startOf('year'),
          dtNow.endOf('year')
        ).start!.toJSDate(),
        to: now,
      };
    case FixedDateRange.LastYear:
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
