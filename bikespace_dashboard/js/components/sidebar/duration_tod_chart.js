import { Component } from '../main.js';
import { defaults, cssVarHSL, hslRange } from './plot_utils.js'

class DurationTimeOfDayChart extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // set categories
    this._tod_bins = [
      {'chart_order': 0, 'label': '12–3', 'ampm': 'am', 'hours': [0,1,2]},
      {'chart_order': 1, 'label': '3–6', 'ampm': 'am', 'hours': [3,4,5]},
      {'chart_order': 2, 'label': '6–9', 'ampm': 'am', 'hours': [6,7,8]},
      {'chart_order': 3, 'label': '9–12', 'ampm': 'am', 'hours': [9,10,11]},
      {'chart_order': 4, 'label': '12–3', 'ampm': 'pm', 'hours': [12,13,14]},
      {'chart_order': 5, 'label': '3–6', 'ampm': 'pm', 'hours': [15,16,17]},
      {'chart_order': 6, 'label': '6–9', 'ampm': 'pm', 'hours': [18,19,20]},
      {'chart_order': 7, 'label': '9–12', 'ampm': 'pm', 'hours': [21,22,23]},
    ];
    this._durations = [
      {'chart_order': 0, 'label': 'Days ', 'value': 'multiday'},
      {'chart_order': 1, 'label': 'Overnight ', 'value': 'overnight'},
      {'chart_order': 2, 'label': 'Hours ', 'value': 'hours'},
      {'chart_order': 3, 'label': 'Minutes ', 'value': 'minutes'},
    ];

    // summarize data
    this.inputData = [];
    this.updateCount();

    // sort data?

    // generate color scale
    // Tried including a yellow color stop in between green and orange, but too hard to distinguish from lower green values with accessibility tests
    let color_scale = [
      {'color': cssVarHSL("--color-primary", "object"), 'alpha': 0.1},
      {'color': cssVarHSL("--color-secondary-orange", "object"), 'alpha': 0.7},
      {'color': cssVarHSL("--color-secondary-red", "object"), 'alpha': 1.0},
    ];
    color_scale = color_scale.map((x, index) => [
      index / (color_scale.length - 1),
      `hsla(${x.color.hue}, ${x.color.saturation}%, ${x.color.lightness}%, ${x.alpha})`,
    ]);

    console.log("color_scale", color_scale); // DEBUG

    // Build chart components
    this.plot = document.getElementById(this.root_id);

    let chart_data = [{
      type: 'heatmap',
      z: this.inputData.map((r) => r.tods.map((c) => c.count > 0 ? c.count : null)),
      x: this.inputData[0].tods.map((c) => c.label + (c.ampm === "pm" ? "&nbsp;" : "")),
      y: this.inputData.map((r) => r.label),// duration
      xgap: 1,
      ygap: 1,
      showscale: false,
      colorscale: color_scale,
      text: this.inputData.map((r) => r.tods.map((c) => c.label + " " + c.ampm)), // x labels for hovertemplate but with am/pm
      hovertemplate: [
        `<b>%{z}</b> reports`,
        `parking for %{y}`,
        `between %{text}`,
        `<extra></extra>`, // hides optional second box
      ].join("<br>"),
    }];

    let layout = {
      title: {
        text: "Demand Duration by Time of Day",
        x: 0,
        pad: {
          l: 4
        },
      },
      yaxis: {
        automargin: true,
        fixedrange: true, // prevent user zoom
        ticks: "",
        tickson: "boundaries",
      },
      xaxis: {
        automargin: true,
        fixedrange: true,
        tickangle: 0, // horizontal
        tickfont: {size: 10},
        ticks: "",
        tickson: "boundaries",
        minor: {showgrid: false},
        title: {
          text: "AM   /   PM",
          font: {size: 10},
        },
      },
      shapes: [{ // shading under "am" in x axis
        type: "rect",
        layer: "below",
        xref: "paper",
        x0: 0,
        x1: 0.5,
        yref: "paper",
        y0: 0,
        y1: -0.14,
        fillcolor: cssVarHSL("--color-secondary-light-grey", "string"),
        line: {width: 0},
      }],
      hoverlabel: { bgcolor: "#FFF" },
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

    let config = defaults.config;

    // generate plot on page
    Plotly.newPlot(this.plot, chart_data, layout, config);

    // interaction

  }

  refresh() {

  }

  /**
   * Update chart inputData based on shared state display data
   */
  updateCount() {
    const test = (dt_string, hours, pd_input, pd_match) => {
      let dt = new Date(dt_string);
      let hour_test = hours.includes(dt.getHours());
      let duration_test = pd_input === pd_match;
      // if (hour_test && duration_test) {
      //   console.log(dt.getHours(), hours, pd_input, pd_match);
      // }
      return hour_test && duration_test;
    };

    let rows = [];
    for (const duration of this._durations) {
      let cols = [];
      for (const tod of this._tod_bins) {
        cols.push(Object.assign({...tod}, {
          'count': this.shared_state.display_data.reduce(
            (a, b) => a + (test(b.parking_time, tod.hours, b.parking_duration, duration.value) ? 1 : 0), 0
          )
        }));
      }
      rows.push(Object.assign(duration, {'tods': cols}));
    }
    
    this.inputData = rows;
    console.log("inputData", this.inputData); // DEBUG
  }

  /**
   * Function to update or toggle this._selected
   * @param {int} index Index number of bar trace clicked by user
   */
  toggleSelected(index) {
    if (index === this._selected) {
      this._selected = null;
    } else {
      this._selected = index;
    }
  }

  setFilter() {

  }

}

export { DurationTimeOfDayChart };