import React from 'react';
import dynamic from 'next/dynamic';

import {PlotParams} from 'react-plotly.js';

import {ReportSummary} from '../report-summary';

import styles from './sidebar-content-data.module.scss';

type ChartProps = Pick<PlotParams, 'className'>;

const DataIssueFrequencyChart = dynamic<ChartProps>(
  () => import('../data-issue-frequency-chart/DataIssueFrequencyChart'),
  {
    loading: () => <></>,
    ssr: false,
  }
);
const DataFrequencyByDayChart = dynamic<ChartProps>(
  () => import('../data-frequency-by-day-chart/DataFrequencyByDayChart'),
  {
    loading: () => <></>,
    ssr: false,
  }
);
const DataDurationByTodChart = dynamic<ChartProps>(
  () => import('../data-duration-by-tod-chart/DataDurationByTodChart'),
  {
    loading: () => <></>,
    ssr: false,
  }
);

export function SidebarContentData() {
  return (
    <>
      <ReportSummary />
      <DataIssueFrequencyChart className={styles.chart} />
      <DataFrequencyByDayChart className={styles.chart} />
      <DataDurationByTodChart className={styles.chart} />
    </>
  );
}
