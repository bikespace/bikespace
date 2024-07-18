import React, {useContext, useMemo} from 'react';
import Plotly, {PlotParams} from 'react-plotly.js';
import {Annotations} from 'plotly.js-dist-min';
import {DateTime, Interval} from 'luxon';

import {layout, config} from '@/config/plotly';

import {ParkingDuration} from '@/interfaces/Submission';

import {SubmissionsContext} from '../context';

import styles from './data-duration-by-tod-chart.module.scss';

function DataDurationByTodChart({className}: Pick<PlotParams, 'className'>) {
  const submissions = useContext(SubmissionsContext);

  const data = useMemo<number[][]>(() => {
    return parkingDurations.map(duration => {
      return intervals.map(
        interval =>
          submissions.filter(submission => {
            const parkingHour = new Date(submission.parking_time).getHours();

            return (
              submission.parking_duration === duration &&
              parkingHour >= interval.start! &&
              parkingHour < (interval.end! === 0 ? 24 : interval.end!)
            );
          }).length
      );
    });
  }, [submissions]);

  const annotations = useMemo<Partial<Annotations>[]>(() => {
    return data
      .map((dArray, i) => {
        return dArray.map((_, j) => ({
          x: `${intervals[j].start}-${intervals[j].end}`,
          y: parkingDurations[i],
          text: data[i][j].toString(),
          showarrow: false,
          font: {color: 'white'},
        }));
      })
      .flat();
  }, [data]);

  return (
    <Plotly
      className={className}
      data={[
        {
          type: 'heatmap',
          x: intervals.map(b => `${b.start}-${b.end}`),
          y: parkingDurations,
          z: data,
          xgap: 1, // space between heatmap tiles
          ygap: 1,
          showscale: false,
          hoverlabel: {bgcolor: 'white'},
          hovertemplate: [
            '<b>%{z}</b> reports',
            'parking for %{y}',
            'between %{x}',
            '<extra></extra>', // hides optional second box
          ].join('<br>'),
          colorscale: colorScale,
        },
      ]}
      layout={{
        ...layout,
        title: {
          text: 'Demand Duration by Time of Day',
          x: 0,
          pad: {l: 4},
        },
        yaxis: {
          //@ts-expect-error labelalias attribute is present
          labelalias: durationLabels,
          automargin: true,
          fixedrange: true, // prevent user zoom
          ticks: '',
          showgrid: false,
          categoryorder: 'array', // ordering
          categoryarray: parkingDurations,
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
          tickangle: 0,
          tickfont: {size: 10},
          ticks: '',
          title: {
            text: 'AM / PM',
            font: {size: 10},
          },
          showgrid: false,
        },
        hoverlabel: {bgcolor: 'white'},
        shapes: [
          {
            // shading under "am" in x axis
            type: 'rect',
            layer: 'below',
            xref: 'paper',
            x0: 0,
            x1: 0.5,
            yref: 'paper',
            y0: 0,
            y1: -0.14,
            fillcolor: styles.cellColor,
            line: {width: 0}, // no border
          },
        ],
        annotations,
        margin: {
          t: 30,
          r: 20,
          b: 4,
          l: 20,
        },
        height: 160,
      }}
      config={config}
    />
  );
}

export default DataDurationByTodChart;
export {DataDurationByTodChart};

const heatmapColorRange = [
  styles.colorScale0,
  styles.colorScale1,
  styles.colorScale2,
];

const colorScale: [number, string][] = heatmapColorRange.map((color, i) => [
  i / (heatmapColorRange.length - 1),
  color,
]);

// 3-hour intervals over 24 hours
const intervals = Interval.fromDateTimes(
  DateTime.fromISO('2024-W06-1'),
  DateTime.fromISO('2024-W06-2')
)
  .splitBy({hours: 3})
  .map(i => ({
    start: i.start?.hour,
    end: i.end?.hour,
  }));

// reverse parking duration because minute comes first but plotly would have displayed it at the bottom but we want it on top
const parkingDurations = Object.values(ParkingDuration).reverse();

const durationLabels = {
  [ParkingDuration.Hours]: 'Hours ',
  [ParkingDuration.Minutes]: 'Minutes ',
  [ParkingDuration.Overnight]: 'Overnight ',
  [ParkingDuration.MultiDay]: 'Days ',
};
