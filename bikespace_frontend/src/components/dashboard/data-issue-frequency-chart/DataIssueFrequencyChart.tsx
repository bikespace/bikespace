import React, {useContext, useState, useEffect} from 'react';
import {PlotParams} from 'react-plotly.js';
import {PlotMouseEvent} from 'plotly.js-dist-min';

import {layout, config} from '@/config/plotly';

import {IssueType} from '@/interfaces/Submission';

import {SubmissionFiltersContext, SubmissionsContext} from '../context';

import {LazyPlot} from '../lazy-plot';

import * as styles from './data-issue-frequency-chart.module.scss';

type InputData = {
  type: IssueType;
  count: number;
  color: string;
};

export function DataIssueFrequencyChart({
  className,
}: Pick<PlotParams, 'className'>) {
  const submissions = useContext(SubmissionsContext);
  const {
    filters: {issue},
    setFilters,
  } = useContext(SubmissionFiltersContext);

  const [data, setData] = useState<InputData[]>([]);

  useEffect(() => {
    const issues = Object.keys(issueLabels) as IssueType[];

    const inputData = issues.map(i => ({
      type: i,
      count: submissions.filter(submission => submission.issues.includes(i))
        .length,
      color: styles[!issue || issue === i ? i : `${i}_light`],
    }));

    setData(inputData);
  }, [submissions, issue]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      issue,
    }));
  }, [issue]);

  const handleClick = (e: PlotMouseEvent) => {
    const point = e.points[0];

    if (!point) return;

    setFilters(prev => ({
      ...prev,
      issue: prev.issue === point.y ? null : (point.y as IssueType),
    }));
  };

  return (
    <LazyPlot
      className={className}
      data={[
        {
          type: 'bar',
          orientation: 'h', // horizontal
          x: data.map(d => d.count),
          y: data.map(d => d.type),
          marker: {color: data.map(d => d.color)},
          text: data.map(d => d.count.toString()),
          hoverinfo: 'none', // remove hover labels
        },
      ]}
      layout={{
        ...layout,
        title: {
          text: 'Problem Type Frequency',
          x: 0,
          pad: {l: 4},
        },
        yaxis: {
          //@ts-expect-error labelalias attribute is present
          labelalias: issueLabels,
          fixedrange: true, // prevent user zoom
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
          range: [0, Math.max(...data.map(d => d.count))],
        },
        margin: {
          t: 30,
          r: 20,
          b: 4,
          l: 120,
        },
        height: 200,
      }}
      config={config}
      onClick={handleClick}
    />
  );
}

const issueLabels = {
  [IssueType.NotProvided]: 'No nearby parking ',
  [IssueType.Damaged]: 'Parking damaged ',
  [IssueType.Full]: 'Parking full ',
  [IssueType.Abandoned]: 'Abandoned bicycle ',
  [IssueType.Other]: 'Other issue ',
} satisfies {[key in IssueType]: string};
