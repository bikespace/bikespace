import React, {useCallback, useState, useEffect, useRef} from 'react';
import Plotly, {PlotParams} from 'react-plotly.js';

import {layout, config} from '@/config/plotly';

import {IssueType} from '@/interfaces/Submission';

import {useStore} from '@/states/store';

import styles from './data-issue-frequency-chart.module.scss';

type InputData = {
  type: IssueType;
  count: number;
  color: string;
};

function DataIssueFrequencyChart({
  className,
  onReady,
}: Pick<PlotParams, 'className'> & {onReady?: () => void}) {
  const {submissions, issues} = useStore(state => ({
    submissions: state.submissions,
    issues: state.filters.issues,
  }));
  const firedRef = useRef(false);

  const [data, setData] = useState<InputData[]>([]);

  useEffect(() => {
    const issueTypes = Object.keys(issueLabels) as IssueType[];

    const inputData = issueTypes.map(i => ({
      type: i,
      count: submissions.filter(submission => submission.issues.includes(i))
        .length,
      color:
        issues.length === 0 || issues.includes(i)
          ? styles[i]
          : styles[`${i}_light`],
    }));

    setData(inputData);
  }, [submissions, issues]);

  const handleAfterPlot = useCallback(() => {
    if (firedRef.current) return; // Guard against multiple calls
    firedRef.current = true;
    onReady?.();
  }, [onReady]);

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
        width: 320 - 4 * 2,
        height: 200,
      }}
      config={config}
      onAfterPlot={handleAfterPlot}
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
