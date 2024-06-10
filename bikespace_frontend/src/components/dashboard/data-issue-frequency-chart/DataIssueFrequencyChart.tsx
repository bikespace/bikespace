import React, {useContext, useState} from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

import {IssueType} from '@/interfaces/Submission';

import {SubmissionsContext} from '../context';

const Plot = createPlotlyComponent(Plotly);

export function DataIssueFrequencyChart() {
  const submissions = useContext(SubmissionsContext);

  const [issue, setIssue] = useState<IssueType | null>(null);

  const data = Object.values(IssueType).map(issue => ({
    type: issue,
    label: `${issueLabels[issue]} `,
    count: submissions.filter(submission => submission.issues.includes(issue))
      .length,
    color: '',
  }));

  data.sort((a, b) => a.count - b.count);

  return (
    <Plot
      data={[
        {
          type: 'bar',
          orientation: 'h', // horizontal
          x: data.map(d => d.count),
          y: data.map(d => d.type),
          marker: {
            color: data.map(d => d.color),
          },
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
