import React from 'react';
import Loadable from 'react-loadable';
import {PlotParams} from 'react-plotly.js';

// Make Plotly plot lazy-loadable - only executed when browser APIs are available on client
const Plotly = Loadable({
  loader: () => import('react-plotly.js'),
  loading: ({timedOut}) =>
    timedOut ? <blockquote>Error: Loading Plotly timed out.</blockquote> : null,
  timeout: 10000,
});

export const LazyPlot = (props: PlotParams) => {
  return <Plotly {...props} />;
};
