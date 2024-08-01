import React, {useState, useEffect, useCallback} from 'react';
import Plotly, {PlotParams} from 'react-plotly.js';
import {PlotMouseEvent} from 'plotly.js-dist-min';

import {layout, config} from '@/config/plotly';

import {Day} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {useSubmissionsStore} from '@/store';

import styles from './data-frequency-by-day-chart.module.scss';

type InputData = {
  name: Day;
  count: number;
};

function DataFrequencyByDayChart({className}: Pick<PlotParams, 'className'>) {
  const queryResult = useSubmissionsQuery();
  const allSubmissions = queryResult.data || [];

  const {submissions, day, setFilters} = useSubmissionsStore(state => ({
    submissions: state.submissions,
    day: state.filters.day,
    setFilters: state.setFilters,
  }));

  const [data, setData] = useState<InputData[]>([]);

  useEffect(() => {
    if (allSubmissions.length === 0 || submissions.length === 0) return;

    const inputData = Object.values(Day)
      .slice(7, 14)
      .map(d => ({
        name: d as Day,
        count: allSubmissions.filter(
          submission => new Date(submission.parking_time).getDay() === d
        ).length,
      }));

    setData(inputData);
  }, [allSubmissions, submissions, day]);

  const handleClick = useCallback(
    (e: PlotMouseEvent) => {
      const point = e.points[0];

      if (!point) return;

      setFilters({
        day: day === point.x ? null : (point.x as Day),
      });

      if (point.x) trackUmamiEvent('daychart', {filter: point.x});
    },
    [day]
  );

  return (
    <Plotly
      className={className}
      data={[
        {
          type: 'bar',
          x: data.map(d => d.name),
          y: data.map(d => d.count),
          marker: {
            color: styles.barColor,
            opacity: day ? data.map(d => (d.name === day ? 1 : 0.25)) : 1,
          },
          text: data.map(d => d.count.toString()),
          textposition: 'outside',
          cliponaxis: false,
          hoverinfo: 'none', // remove hover labels
        },
      ]}
      layout={{
        ...layout,
        title: {
          text: 'Frequency By Day',
          x: 0,
          pad: {l: 4},
        },
        yaxis: {
          automargin: true,
          fixedrange: true, // prevent user zoom
        },
        xaxis: {
          //@ts-expect-error labelalias attribute is present
          labelalias: dayLabels,
          automargin: true,
          fixedrange: true,
          tickmode: 'linear',
        },
        margin: {
          t: 30,
          r: 20,
          b: 4,
          l: 20,
        },
        height: 160,
      }}
      config={config}
      onClick={handleClick}
    />
  );
}

export default DataFrequencyByDayChart;
export {DataFrequencyByDayChart};

const dayLabels = {
  [Day.Monday]: 'Mon',
  [Day.Tuesday]: 'Tue',
  [Day.Wednesday]: 'Wed',
  [Day.Thursday]: 'Thu',
  [Day.Friday]: 'Fri',
  [Day.Saturday]: 'Sat',
  [Day.Sunday]: 'Sun',
};
