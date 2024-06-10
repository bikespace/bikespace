import Plotly from 'plotly.js-dist-min';

export const layout = {
  dragmode: false,
  paper_bgcolor: 'transparent', // reset chart background to transparent to give more CSS control
  modebar: {
    color: 'hsl(137, 56%, 73%)',
    activecolor: 'hsl(137, 68%, 45%)',
    bgcolor: 'transparent',
  },
} as Plotly.Layout;

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
