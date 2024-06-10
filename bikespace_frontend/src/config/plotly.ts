import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

export const Plot = createPlotlyComponent(Plotly);

export const layout = {
  dragmode: false,
  paper_bgcolor: 'black', // reset chart background to transparent to give more CSS control
  modebar: {
    color: 'hsl(137, 56%, 73%)',
    activecolor: 'hsl(137, 68%, 45%)',
    bgcolor: 'black',
  },
};

export const config = {
  displaylogo: false,
  modeBarButtonsToRemove: [
    'zoom2d',
    'pan2d',
    'select2d',
    'lasso2d',
    'zoomIn2d',
    'zoomOut2d',
    'autoScale2d',
    'resetScale2d',
  ] as Plotly.ModeBarDefaultButtons[],
};
