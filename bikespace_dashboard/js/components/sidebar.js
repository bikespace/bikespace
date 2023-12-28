import { Component } from './main.js';

class SummaryBox extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);
    this.build();
  }

  build() {
    // Calculate date range of entries
    let submission_dates = this.shared_state.display_data.map((s) => new Date(s.parking_time));
    let earliest_entry = submission_dates.reduce((p, c) => p < c ? p : c);
    let latest_entry = submission_dates.reduce((p, c) => p > c ? p : c);

    // Date formatting 
    const date_options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    let content = [
      `<div class="flex">`,
        `<div id="entry-count">${this.shared_state.display_data.length.toLocaleString('en-CA')}</div>`,
        `<button class="clear-filter" type="button"><img src="assets/clear-filter.svg"/> Clear Filters</button>`,
      `</div>`,
      `<div class="summary-desc">Total Reports</div>`,
      `<div class="summary-desc">${earliest_entry.toLocaleDateString('en-CA', date_options)} – ${latest_entry.toLocaleDateString('en-CA', date_options)}</div>`
    ].join("");

    $(`#${this.root_id}`).empty().append(content);

    $(`#${this.root_id} button.clear-filter`).on('click', (e) => {
      this.shared_state.filters = {};
    })
  }

  refresh() {
    this.build();
  }
}
  
class IssueChart extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Note: no option for spacing between y-axis labels and y-axis line in plotly js, have to add a trailing space
    this.issue_labels = {
      'not_provided': "No nearby parking ",
      'full': "Parking was full ",
      'damaged': "Parking was damaged ",
      'abandoned': "Abandoned bicycle ",
      'other': "Other issue "
    };
    this.issue_labels_lookup = Object.fromEntries(Object.entries(this.issue_labels).map(a => a.reverse()));

    // summarize data
    let issues = new Set(this.shared_state.display_data.reduce(
      (a, b) => a.concat(b['issues']), []));
    this.inputData = [];
    for (let issue of issues) {
      this.inputData.push({
        'type': issue,
        'label': this.issue_labels[issue] ?? issue
      });
    }
    this.updateCount();

    // sort data ascending (shows desc in chart, bars are added bottom to top)
    // this could be done with layout.yaxis.categoryorder in plotly js, but it messes up the color gradient
    this.inputData.sort((a, b) => a.count - b.count);

    // generate and assign colour palette
    let palette = hslRange(
      cssVarHSL("--color-secondary-red"),
      cssVarHSL("--color-primary"),
      this.inputData.length
    );
    for (let i = 0; i < this.inputData.length; i++) {
      this.inputData[i].color = palette.reverse()[i];
    }

    // set x axis range
    const maxX = Math.max(...this.inputData.map((x) => x.count));
    this.xAxisRange = [0, maxX];

    // Build chart components
    this.plot = document.getElementById(this.root_id);

    let chart_data = [{
      type: 'bar',
      orientation: 'h', // horizontal
      x: this.inputData.map((x) => x.count),
      y: this.inputData.map((x) => x.type),
      marker: {
        color: this.inputData.map((x) => x.color)
      },
      text: this.inputData.map((x) => x.count.toString()),
      hoverinfo: "none", // remove hover labels
    }];
    
    let layout = {
      title: {
        text: "Problem Type Frequency",
        x: 0,
        pad: {
          l: 4
        }
      },
      yaxis: {
        labelalias: this.issue_labels, 
        fixedrange: true // prevent user zoom
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
        l: 130
      },
      width: 320 - 4 * 2,
      height: 200,
      dragmode: false,
      paper_bgcolor: "rgba(0,0,0,0)", // reset chart background to transparent to give more CSS control
      modebar: {
        color: cssVarHSL("--color-primary-d50p", "string"),
        activecolor: cssVarHSL("--color-primary", "string"),
        bgcolor: "rgba(0,0,0,0)"
      },
    };

    let config = {
      displaylogo: false,
      modeBarButtonsToRemove: [
        'zoom2d',
        'pan2d',
        'select2d',
        'lasso2d',
        'zoomIn2d',
        'zoomOut2d',
        'autoScale2d',
        'resetScale2d'
      ]
    };

    // generate plot on page
    Plotly.newPlot(this.plot, chart_data, layout, config);

    // clicking on the bar trace updates the shared filter
    this.plot.on('plotly_click', (data) => {
      const filter_issue = data.points[0].y;
      const bar_index = this.plot.data[0].y.findIndex((x) => x == filter_issue);
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
    Plotly.restyle(this.plot, {
      'x': [this.inputData.map((x) => x.count)],
      'text': [this.inputData.map((x) => x.count.toString())],
      'selectedpoints': [this._selected === null ? null : [this._selected]],
    }, [0]);

    this.addLabelClickHandler();
  }

  /**
   * Update chart inputData based on shared state display data
   */
  updateCount() {
    this.inputData = this.inputData.map((r) => 
      Object.assign(r, {'count': this.shared_state.display_data.reduce(
        (a, b) => a + (b['issues'].includes(r.type) ? 1 : 0), 0
      )})
    )
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
    $(`#${this.root_id} .ytick`).on('click', (e) => {
      const label_text = e.target.attributes['data-unformatted'].value;
      const filter_issue = this.issue_labels_lookup[label_text];
      // selectedpoints doesn't work with the category name
      const bar_index = this.plot.data[0].y.findIndex((x) => x == filter_issue);
      
      this.toggleSelected(bar_index);
      this.setFilter(filter_issue);
    });
  }

  /**
   * Set or toggle shared state filter on "issue" property
   * @param {string} filter_issue 
   */
  setFilter(filter_issue) {
    let filters = this.shared_state.filters;
    // reset to no filter on toggle
    if (filters?.issues?.contains == filter_issue) {
      delete filters.issues;
    } else {
      filters.issues = {
        'contains': filter_issue,
        'test': function(issue_list) {
          return issue_list.includes(filter_issue);
        }
      };
    }
    this.shared_state.filters = filters;
  }

}

export { SummaryBox, IssueChart };

/**
 * Function to return values for a hsl CSS variable color
 * @param {string} key CSS variable name
 * @returns {Object} Object with attributes 'hue', 'saturation', and 'lightness'
 */
function cssVarHSL(key, return_type = "object") {
  let hsl_str = getComputedStyle(document.documentElement, null).getPropertyValue(key);
  let pattern = /hsl\((?<hue>\d{1,3})\s?,\s?(?<saturation>\d{1,3})\%\s?,\s?(?<lightness>\d{1,3})\%\s?\)/;
  let match = pattern.exec(hsl_str);
  if (return_type == "string") {
    return hsl_str;
  } else {
    return {
      'hue': Number(match.groups.hue),
      'saturation': Number(match.groups.saturation),
      'lightness': Number(match.groups.lightness)
    };
  }
}

/**
 * Function to generate an array of colors from a start and finish color
 * @param {Object} start Object with attributes 'hue', 'saturation', and 'lightness'
 * @param {Object} finish Object with attributes 'hue', 'saturation', and 'lightness'
 * @param {number} steps Length of array to return, including start and finish entries
 * @param {boolean} [increase=True] Whether values go up from start to finish (True, default) or down (False)
 * @returns {Array} An array of hsl colors
 */
function hslRange(start, finish, steps, increase = true) {
  let rel_finish_hue
  if (finish.hue < start.hue) {
    rel_finish_hue = finish.hue + 360;
  } else {
    rel_finish_hue = finish.hue;
  }
  let hue_var = rel_finish_hue - start.hue;
  let hue_step = hue_var / (steps - 1);
  let colors = [start];
  for (let i = 1; i < steps - 1; increase ? i++ : i--) {
    colors.push({
      'hue': Math.round((start.hue + (i * hue_step))) % 360,
      'saturation': start.saturation,
      'lightness': start.lightness
    });
  }
  colors.push(finish);
  let color_strings = colors.map(
    (c) => `hsl(${c.hue}, ${c.saturation}%, ${c.lightness}%)`
    );
  return color_strings;
}