import {Component} from '../../main.js';
import {defaults} from './plot_utils.js';
import {issue_attributes as ia} from '../../issue_attributes.js';

class IssueChart extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   */
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Note: no option for spacing between y-axis labels and y-axis line in plotly js, have to add a trailing space
    this.issue_labels = {};
    for (const entry of Object.values(ia)) {
      this.issue_labels[entry.id] = ia[entry.id].label_short + ' ';
    }
    this.issue_labels_lookup = Object.fromEntries(
      Object.entries(this.issue_labels).map(a => a.reverse())
    );

    // summarize data
    const issues = new Set(
      this.shared_state.display_data.reduce((a, b) => a.concat(b['issues']), [])
    );
    this.inputData = [];
    for (const issue of issues) {
      this.inputData.push({
        type: issue,
        label: this.issue_labels[issue] ?? issue,
      });
    }
    this.updateCount();

    // sort data ascending (shows desc in chart, bars are added bottom to top)
    // this could be done with layout.yaxis.categoryorder in plotly js, but it messes up the color gradient
    this.inputData.sort((a, b) => a.count - b.count);

    // assign colors to inputData
    for (const i in this.inputData) {
      this.inputData[i].color = ia[this.inputData[i].type].color;
    }

    // set x axis range
    const maxX = Math.max(...this.inputData.map(r => r.count));
    this.xAxisRange = [0, maxX];

    // Build chart components
    this.plot = document.getElementById(this.root_id);

    const chart_data = [
      {
        type: 'bar',
        orientation: 'h', // horizontal
        x: this.inputData.map(r => r.count),
        y: this.inputData.map(r => r.type),
        marker: {
          color: this.inputData.map(r => r.color),
        },
        text: this.inputData.map(r => r.count.toString()),
        hoverinfo: 'none', // remove hover labels
      },
    ];

    const layout = {
      title: {
        text: 'Problem Type Frequency',
        x: 0,
        pad: {
          l: 4,
        },
      },
      yaxis: {
        labelalias: this.issue_labels,
        fixedrange: true, // prevent user zoom
      },
      xaxis: {
        automargin: true,
        fixedrange: true,
        range: this.xAxisRange,
      },
      margin: {
        t: 30,
        r: 20,
        b: 4,
        l: 120,
      },
      width: 320 - 4 * 2,
      height: 200,
      ...defaults.layout,
    };

    const config = defaults.config;

    // generate plot on page
    Plotly.newPlot(this.plot, chart_data, layout, config);

    // clicking on the bar trace updates the shared filter
    this.plot.on('plotly_click', data => {
      const filter_issue = data.points[0].y;
      const bar_index = this.plot.data[0].y.findIndex(x => x === filter_issue);
      this.toggleSelected(bar_index);
      this.setFilter(filter_issue);
    });

    // clicking on the axis label updates the shared filter
    this.addLabelClickHandler();
  }

  refresh() {
    this.updateCount();

    // clear selection if no filter applied
    if (!this.shared_state.filters.issues) {
      this._selected = null;
    }

    // restyle arguments must be wrapped in arrays since they are applied element-wise against the trace(s) specified in the third parameter
    Plotly.restyle(
      this.plot,
      {
        x: [this.inputData.map(r => r.count)],
        text: [this.inputData.map(r => r.count.toString())],
        selectedpoints: [this._selected === null ? null : [this._selected]],
      },
      [0]
    );

    this.addLabelClickHandler();
  }

  /**
   * Update chart inputData based on shared state display data
   */
  updateCount() {
    this.inputData = this.inputData.map(r =>
      Object.assign(r, {
        count: this.shared_state.display_data.reduce(
          (a, b) => a + (b['issues'].includes(r.type) ? 1 : 0),
          0
        ),
      })
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
   * Add click event handler for axis labels (has to be done manually, axis label not normally interactable with plotly js)
   */
  addLabelClickHandler() {
    $(`#${this.root_id} .ytick`).on('click', e => {
      const label_text = e.target.attributes['data-unformatted'].value;
      const filter_issue = this.issue_labels_lookup[label_text];
      // selectedpoints doesn't work with the category name
      const bar_index = this.plot.data[0].y.findIndex(x => x === filter_issue);

      this.toggleSelected(bar_index);
      this.setFilter(filter_issue);
    });
  }

  /**
   * Set or toggle shared state filter on "issue" property
   * @param {string} filter_issue
   */
  setFilter(filter_issue) {
    const filters = this.shared_state.filters;
    // reset to no filter on toggle
    if (filters?.issues?.contains === filter_issue) {
      delete filters.issues;
    } else {
      filters.issues = {
        contains: filter_issue,
        test: function (issue_list) {
          return issue_list.includes(filter_issue);
        },
      };
    }
    super.analytics_event(this.root_id, filters);
    this.shared_state.filters = filters;
  }
}

export {IssueChart};
