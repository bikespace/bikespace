import React, {Suspense, useCallback, useState} from 'react';
import dynamic from 'next/dynamic';

import {PlotParams} from 'react-plotly.js';

import {Spinner} from '@/components/shared-ui/spinner';

import {ReportSummary} from '../report-summary';

import styles from './_SidebarContent.module.scss';

type ChartProps = Pick<PlotParams, 'className'> & {onReady: () => void};

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

export function SidebarContentInsights() {
  const TOTAL = 3;
  const [readyCount, setReadyCount] = useState(0);
  const markReady = useCallback(
    () => setReadyCount(c => Math.min(TOTAL, c + 1)),
    []
  );
  const allReady = readyCount >= TOTAL;
  return (
    <div>
      {!allReady && (
        <Spinner overlay label="Loading insights..." style={{zIndex: 3000}} />
      )}
      <div style={{visibility: allReady ? 'visible' : 'hidden'}}>
        <ReportSummary />
        <DataIssueFrequencyChart className={styles.chart} onReady={markReady} />
        <DataFrequencyByDayChart className={styles.chart} onReady={markReady} />
        <DataDurationByTodChart className={styles.chart} onReady={markReady} />
      </div>
    </div>
  );
}
