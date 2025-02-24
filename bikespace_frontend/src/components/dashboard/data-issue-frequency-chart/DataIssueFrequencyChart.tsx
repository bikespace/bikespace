import React, {useCallback, useState, useEffect} from 'react';
import Plotly, {PlotParams} from 'react-plotly.js';
import {PlotMouseEvent, Image} from 'plotly.js-dist-min';

import {layout, config} from '@/config/plotly';

import {IssueType} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsStore} from '@/states/store';

import styles from './data-issue-frequency-chart.module.scss';

import notProvidedIcon from '@/assets/icons/icon_not_provided.svg';
import abandonedIcon from '@/assets/icons/icon_abandoned.svg';
import fullIcon from '@/assets/icons/icon_full.svg';
import damagedIcon from '@/assets/icons/icon_damaged.svg';
import otherIcon from '@/assets/icons/icon_other.svg';

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
          r: 20, // 20
          b: 4,
          l: 140, // 140
        },
        width: 320 - 4 * 2,
        height: 200,
        images: issueImages,
      }}
      config={config}
      onClick={handleClick}
    />
  );
}

export default DataIssueFrequencyChart;
export {DataIssueFrequencyChart};

const spacer = '       ';

const issueLabels = {
  [IssueType.NotProvided]: 'No nearby parking ' + spacer,
  [IssueType.Damaged]: 'Parking damaged ' + spacer,
  [IssueType.Full]: 'Parking full ' + spacer,
  [IssueType.Abandoned]: 'Abandoned bicycle ' + spacer,
  [IssueType.Other]: 'Other issue ' + spacer,
} satisfies {[key in IssueType]: string};

const issueIcons = {
  [IssueType.NotProvided]: notProvidedIcon.src,
  [IssueType.Damaged]: damagedIcon.src,
  [IssueType.Full]: fullIcon.src,
  [IssueType.Abandoned]: abandonedIcon.src,
  [IssueType.Other]: otherIcon.src,
} satisfies {[key in IssueType]: string};

const baseImage = {
  // x: -((140 - 4 * 2) / (320 - 140)), // 1.05 for right
  // x: 1.05,
  x: -0.01,
  sizex: 0.16,
  sizey: 0.16,
  xanchor: 'right', // right
  yanchor: 'bottom',
};

const issueImages = Object.entries(issueIcons).map(([k, v], i) => {
  return {
    ...baseImage,
    y: i / Object.values(issueIcons).length + 0.02,
    source: v,
  } as Partial<Image>;
});

console.log(issueImages);
