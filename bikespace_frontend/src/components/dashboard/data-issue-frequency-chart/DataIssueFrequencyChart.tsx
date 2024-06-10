import React, {useContext, useState, useEffect} from 'react';

import {Plot, config} from '@/config/plotly';

import {IssueType} from '@/interfaces/Submission';

import {SubmissionFiltersContext, SubmissionsContext} from '../context';

import * as styles from './data-issue-frequency-chart.module.scss';

export function DataIssueFrequencyChart() {
  const submissions = useContext(SubmissionsContext);
  const {setFilters} = useContext(SubmissionFiltersContext)!;

  const [issue, setIssue] = useState<IssueType | null>(null);

  const data = Object.values(IssueType).map(i => ({
    type: i,
    label: `${issueLabels[i]} `,
    count: submissions.filter(submission => submission.issues.includes(i))
      .length,
    color: styles[!issue || issue === i ? i : `${i}_light`],
  }));

  data.sort((a, b) => a.count - b.count);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      issue,
    }));
  }, [issue]);

  return (
    <Plot
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
        title: {
          text: 'Problem Type Frequency',
          x: 0,
          pad: {l: 4},
        },
        yaxis: {
          // @ts-expect-error labelalias key present
          labelalias: data.map(d => d.label),
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
        width: 320 - 4 * 2,
        height: 200,
      }}
      config={config}
    />
  );
}

const issueLabels = {
  [IssueType.NotProvided]: 'No nearby parking',
  [IssueType.Damaged]: 'Parking damaged',
  [IssueType.Abandoned]: 'Abandoned bicycle',
  [IssueType.Other]: 'Other issue',
  [IssueType.Full]: 'Parking full',
};
