import React, {useCallback, useState, useEffect} from 'react';
import Plotly, {PlotParams} from 'react-plotly.js';
import {PlotMouseEvent} from 'plotly.js-dist-min';

import {layout, config} from '@/config/plotly';

import {IssueType} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsStore} from '@/store';

import styles from './data-issue-frequency-chart.module.scss';

type InputData = {
  type: IssueType;
  count: number;
  color: string;
};

function DataIssueFrequencyChart({className}: Pick<PlotParams, 'className'>) {
  const {submissions, issue, setFilters} = useSubmissionsStore(state => ({
    submissions: state.submissions,
    issue: state.filters.issue,
    setFilters: state.setFilters,
  }));

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
    if (issue === null) return;

    trackUmamiEvent('issuechart', {filter: issue});
  }, [issue]);

  const handleClick = useCallback(
    (e: PlotMouseEvent) => {
      const point = e.points[0];

      if (!point) return;

      setFilters({issue: issue === point.y ? null : (point.y as IssueType)});
    },
    [issue]
  );

  return (
    <Plotly
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

export default DataIssueFrequencyChart;
export {DataIssueFrequencyChart};

const issueLabels = {
  [IssueType.NotProvided]: 'No nearby parking ',
  [IssueType.Damaged]: 'Parking damaged ',
  [IssueType.Full]: 'Parking full ',
  [IssueType.Abandoned]: 'Abandoned bicycle ',
  [IssueType.Other]: 'Other issue ',
} satisfies {[key in IssueType]: string};
