import { Component } from '../main.js';
import { defaults, cssVarHSL } from './plot_utils.js'

class DayChart extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // summarize data
    let days = [
      {'index': 1, 'chart_order': 0, 'name': 'Monday'},
      {'index': 2, 'chart_order': 1, 'name': 'Tuesday'},
      {'index': 3, 'chart_order': 2, 'name': 'Wednesday'},
      {'index': 4, 'chart_order': 3, 'name': 'Thursday'},
      {'index': 5, 'chart_order': 4, 'name': 'Friday'},
      {'index': 6, 'chart_order': 5, 'name': 'Saturday'},
      {'index': 0, 'chart_order': 6, 'name': 'Sunday'},
    ];

    this.inputData = days;
    this.updateCount();

    // sort data
    // layout.xaxis.categoryorder doesn't work; can only do by value or label
    this.inputData.sort((a, b) => a.chart_order - b.chart_order);

    // Build chart components
    this.plot = document.getElementById(this.root_id);

    let chart_data = [{
      type: 'bar',
      x: this.inputData.map((r) => r.name.slice(0, 3)),
      y: this.inputData.map((r) => r.count),
      marker: {
        color: cssVarHSL("--color-primary", "string")
      },
      text: this.inputData.map((r) => r.count.toString()),
      textposition: "outside",
      cliponaxis: false,
      hoverinfo: "none", // remove hover labels
    }];

    let layout = {
      title: {
        text: "Frequency by Day",
        x: 0,
        // y: 1,
        pad: {
          // t: 4,
          l: 4,
        },
      },
      yaxis: {
        fixedrange: true, // prevent user zoom
        automargin: true,
      },
      xaxis: {
        automargin: true,
        fixedrange: true,
      },
      margin: {
        t: 30,
        r: 20,
        b: 4,
        l: 20,
      },
      width: 320 - 4 * 2,
      height: 200,
      ...defaults.layout,
    };

    let config = defaults.config;

    // generate plot on page
    Plotly.newPlot(this.plot, chart_data, layout, config);

    // clicking on the bar trace updates the shared filter
    this.plot.on('plotly_click', (data) => {
      const point_index = data.points[0].pointIndex;
      const day_index = days.find((d) => d.chart_order === point_index).index;
      this.toggleSelected(point_index);
      this.setFilter(day_index);
    });

  }

  refresh() {
    this.updateCount();

    // clear selection if no filter applied
    if (!this.shared_state.filters.parking_time) {
      this._selected = null;
    }

    // restyle arguments must be wrapped in arrays since they are applied element-wise against the trace(s) specified in the third parameter
    Plotly.restyle(this.plot, {
      'y': [this.inputData.map((r) => r.count)],
      'text': [this.inputData.map((r) => r.count.toString())],
      'selectedpoints': [this._selected === null ? null : [this._selected]],
    }, [0]);
  }

  /**
   * Update chart inputData based on shared state display data
   */
  updateCount() {
    // Remove day filter for this chart, otherwise the other bars all go to zero
    let filters = {...this.shared_state.filters}; // copy by values
    if (filters?.parking_time) {
      delete filters.parking_time;
    }
    let display_data_all_days = this.shared_state.applyFilters(filters);

    this.inputData = this.inputData.map((r) => 
      Object.assign(r, {'count': display_data_all_days.reduce(
        (a, b) => a + (new Date(b['parking_time']).getDay() === r.index ? 1 : 0), 0
        )})
    );
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

  /**
   * Set or toggle shared state filter on "parking_time" property
   * @param {int} day_index
   */
  setFilter(day_index) {
    let filters = this.shared_state.filters;
    // reset to no filter on toggle
    if (filters?.parking_time?.day_index == day_index) {
      delete filters.parking_time;
    } else {
      filters.parking_time = {
        'day_index': day_index,
        'test': function(time_str) {
          return new Date(time_str).getDay() === day_index;
        }
      };
    }
    this.shared_state.filters = filters;
  }

}

export { DayChart };