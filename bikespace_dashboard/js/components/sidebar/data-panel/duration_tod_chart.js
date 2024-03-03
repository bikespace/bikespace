import {Component} from '../../main.js';
import {defaults, cssVarHSL} from './plot_utils.js';

// Note: "tod" = "Time of Day"

class DurationTimeOfDayChart extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    // set categories for x and y axes
    this._tod_bins = [
      {chart_order: 0, label: '12–3', ampm: 'am', hours: [0, 1, 2]},
      {chart_order: 1, label: '3–6', ampm: 'am', hours: [3, 4, 5]},
      {chart_order: 2, label: '6–9', ampm: 'am', hours: [6, 7, 8]},
      {chart_order: 3, label: '9–12', ampm: 'am', hours: [9, 10, 11]},
      {chart_order: 4, label: '12–3', ampm: 'pm', hours: [12, 13, 14]},
      {chart_order: 5, label: '3–6', ampm: 'pm', hours: [15, 16, 17]},
      {chart_order: 6, label: '6–9', ampm: 'pm', hours: [18, 19, 20]},
      {chart_order: 7, label: '9–12', ampm: 'pm', hours: [21, 22, 23]},
    ];
    this._durations = [
      {chart_order: 0, label: 'Days ', value: 'multiday'},
      {chart_order: 1, label: 'Overnight ', value: 'overnight'},
      {chart_order: 2, label: 'Hours ', value: 'hours'},
      {chart_order: 3, label: 'Minutes ', value: 'minutes'},
    ];

    // summarize data
    this.inputData = [];
    this.updateCount();

    // generate color scale
    // Tried including a yellow color stop in between green and orange, but too hard to distinguish from lower green values with accessibility tests
    let color_scale = [
      {color: cssVarHSL('--color-primary', 'object'), alpha: 0.1},
      {color: cssVarHSL('--color-secondary-orange', 'object'), alpha: 0.7},
      {color: cssVarHSL('--color-secondary-red', 'object'), alpha: 1.0},
    ];
    color_scale = color_scale.map((x, index) => [
      index / (color_scale.length - 1),
      `hsla(${x.color.hue}, ${x.color.saturation}%, ${x.color.lightness}%, ${x.alpha})`,
    ]);

    // Build chart components
    this.plot = document.getElementById(this.root_id);

    const chart_data = [
      {
        type: 'heatmap',
        z: this.inputData.map(r =>
          r.tods.map(c => (c.count > 0 ? c.count : null))
        ), // count of reports
        x: this.inputData[0].tods.map(
          c => c.label + (c.ampm === 'pm' ? '&nbsp;' : '')
        ), // time of day
        y: this.inputData.map(r => r.label), // duration
        xgap: 1, // space between heatmap tiles
        ygap: 1,
        showscale: false,
        colorscale: color_scale,
        text: this.inputData.map(r => r.tods.map(c => c.label + ' ' + c.ampm)), // x labels for hovertemplate but with am/pm
        hovertemplate: [
          '<b>%{z}</b> reports',
          'parking for %{y}',
          'between %{text}',
          '<extra></extra>', // hides optional second box
        ].join('<br>'),
      },
    ];

    const layout = {
      title: {
        text: 'Demand Duration by Time of Day',
        x: 0,
        pad: {
          l: 4,
        },
      },
      hoverlabel: {bgcolor: 'white'},
      yaxis: {
        automargin: true,
        fixedrange: true, // prevent user zoom
        ticks: '', // this setting uses "" instead of false
        tickson: 'boundaries', // location of gridlines
      },
      xaxis: {
        automargin: true,
        fixedrange: true,
        tickangle: 0, // horizontal x labels
        tickfont: {size: 10},
        ticks: '',
        tickson: 'boundaries',
        minor: {showgrid: false},
        title: {
          text: 'AM   /   PM',
          font: {size: 10},
        },
      },
      shapes: [
        {
          // shading under "am" in x axis
          type: 'rect',
          layer: 'below',
          xref: 'paper',
          x0: 0,
          x1: 0.5,
          yref: 'paper',
          y0: 0,
          y1: -0.14,
          fillcolor: cssVarHSL('--color-secondary-light-grey', 'string'),
          line: {width: 0}, // no border
        },
      ],
      margin: {
        t: 30,
        r: 20,
        b: 4,
        l: 20,
      },
      width: 320 - 4 * 2,
      height: 160,
      ...defaults.layout,
    };

    const config = defaults.config;

    // generate plot on page
    Plotly.newPlot(this.plot, chart_data, layout, config);

    // add label to max value
    this.addMaxLabel();
  }

  refresh() {
    this.updateCount();

    // if selection implemented later - clear selection if no filter applied

    // restyle arguments must be wrapped in arrays since they are applied element-wise against the trace(s) specified in the third parameter
    Plotly.restyle(
      this.plot,
      {
        z: [
          this.inputData.map(r =>
            r.tods.map(c => (c.count > 0 ? c.count : null))
          ),
        ],
        // selectedpoints: []
      },
      [0]
    );
    this.addMaxLabel();
  }

  /**
   * Update chart inputData based on shared state display data
   */
  updateCount() {
    // function to check whether report falls into specified duration and parking_time (time of day)
    const test = (dt_string, hours, pd_input, pd_match) => {
      const dt = new Date(dt_string);
      const hour_test = hours.includes(dt.getHours());
      const duration_test = pd_input === pd_match;
      return hour_test && duration_test;
    };

    // count reports for each cross-category
    const rows = [];
    for (const duration of this._durations) {
      const cols = [];
      for (const tod of this._tod_bins) {
        cols.push(
          Object.assign(
            {...tod},
            {
              count: this.shared_state.display_data.reduce(
                (a, b) =>
                  a +
                  (test(
                    b.parking_time,
                    tod.hours,
                    b.parking_duration,
                    duration.value
                  )
                    ? 1
                    : 0),
                0
              ),
            }
          )
        );
      }
      rows.push(Object.assign(duration, {tods: cols}));
    }

    this.inputData = rows;
  }

  /**
   * Function to update or toggle this._selected
   * @param {{row: number, column: number}} index Index number of bar trace clicked by user
   */
  toggleSelected(index) {
    const {row, column} = index;
    if (row === this._selected?.row && column === this._selected?.column) {
      this._selected = null;
    } else {
      this._selected = index;
    }
  }

  setFilter() {
    // currently not implemented
  }

  addMaxLabel() {
    const z = this.plot.data[0].z;
    const max = Math.max(...z.flat());

    // need to know location of max value(s) to add number annotation
    const indexes_of_max = z.reduce((ra, rcv, rci) => {
      const rmaxes = rcv.reduce((ca, ccv, cci) => {
        if (ccv === max) ca.push([rci, cci]);
        return ca;
      }, []);
      ra.push(...rmaxes);
      return ra;
    }, []);

    // build annotations using r,c locations
    const annotations = indexes_of_max.map(([row, column]) => ({
      xref: 'x',
      yref: 'y',
      x: column,
      y: row,
      text: max,
      showarrow: false,
      font: {color: 'white'},
    }));

    Plotly.relayout(this.plot, {annotations: annotations});
  }
}

export {DurationTimeOfDayChart};
