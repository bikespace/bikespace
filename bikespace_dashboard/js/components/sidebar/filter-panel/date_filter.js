import {Component} from '../../main.js';

class DateFilter extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   */
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Calculate date range for all data
    const all_dates = this.shared_state.response_data.map(
      s => new Date(s.parking_time)
    );
    this.earliest_all = all_dates.reduce((p, c) => (p < c ? p : c));
    this.latest_all = all_dates.reduce((p, c) => (p > c ? p : c));
    const today = new Date();

    const a_day = 24*60*60*1000;
    const prior_7_days = new Date(today - 7 * a_day);
    const prior_30_days = new Date(today - 30 * a_day);
    const prior_90_days = new Date(today - 90 * a_day);
    const prior_12_months = new Date(
      new Date(today).setFullYear(today.getFullYear() - 1)
      );

    // TODO validate the date ranges make sense

    this.date_range_options = {
      "all_dates": {
        "label": "All Dates",
        "group": 0,
        "min": null,
        "max": null,
      },
      "last_7_days": {
        "label": "Last 7 Days",
        "group": 1,
        "min": prior_7_days.toISOString().slice(0,10),
        "max": today.toISOString().slice(0,10),
      },
      "last_30_days": {
        "label": "Last 30 Days",
        "group": 1,
        "min": prior_30_days.toISOString().slice(0,10),
        "max": today.toISOString().slice(0,10),
      },
      "last_90_days": {
        "label": "Last 90 Days",
        "group": 1,
        "min": prior_90_days.toISOString().slice(0,10),
        "max": today.toISOString().slice(0,10),
      },
      "last_12_months": {
        "label": "Last 12 Months",
        "group": 2,
        "min": prior_12_months.toISOString().slice(0,10),
        "max": today.toISOString().slice(0,10),
      },
      "this_year": {
        "label": "This Year",
        "group": 2,
        "min": `${today.getFullYear()}-01-01`,
        "max": `${today.getFullYear()}-12-31`,
      },
      "last_year": {
        "label": "Last Year",
        "group": 2,
        "min": `${today.getFullYear() - 1}-01-01`,
        "max": `${today.getFullYear() - 1}-12-31`,
      },
      "custom_range": {
        "label": "Custom Range",
        "group": 3,
        "min": null,
        "max": null,
      },
    };
    this.build();
  }

  build() {
    // Calculate date range of displayed entries
    const display_dates = this.shared_state.display_data.map(
      s => new Date(s.parking_time)
    );
    const earliest_display = display_dates.reduce((p, c) => (p < c ? p : c));
    const latest_display = display_dates.reduce((p, c) => (p > c ? p : c));

    // Date formatting
    const date_options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const content = [
      `<h3>Date(s):</h3>`,
      `<div class="">${
        earliest_display.toLocaleDateString('en-CA', date_options)
      } – ${
        latest_display.toLocaleDateString('en-CA', date_options)
      }</div>`,
      `<select name="date-range-select" id="filter-date-range-select">`,
        `<option value="all_dates">All Dates</option>`,
        `<hr />`,
        `<option value="last_7_days">Last 7 days</option>`,
        `<option value="last_30_days">Last 30 days</option>`,
        `<option value="last_90_days">Last 90 days</option>`,
        `<hr />`,
        `<option value="last_12_months">Last 12 months</option>`,
        `<option value="this_year">This Year</option>`,
        `<option value="last_year">Last Year</option>`,
        `<hr />`,
        `<option value="custom_range">Custom Range</option>`,
      `</select>`,
      `<div class="date-input-group" id="filter-date-input-group" hidden>`,
        `<div class="date-input">`,
          `<label for="filter-start-date">Start date:</label>`,
          `<input 
            type="date" 
            id="filter-start-date" 
            name="start-date" 
            value="${earliest_display.toISOString().slice(0,10)}"
            min="${this.earliest_all.toISOString().slice(0,10)}"
            max="${this.latest_all.toISOString().slice(0,10)}"
          />`,
        `</div>`,
        `<div class="date-input">`,
          `<label for="filter-end-date">End date:</label>`,
          `<input 
            type="date" 
            id="filter-end-date" 
            name="end-date" 
            value="${latest_display.toISOString().slice(0,10)}"
            min="${this.earliest_all.toISOString().slice(0,10)}"
            max="${this.latest_all.toISOString().slice(0,10)}"
          />`,
        `</div>`,
      `</div>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);
    $("#filter-date-range-select").on('change', (e) => {
      const selection = e.target.value;

      // show or hide custom date picker
      if (selection === "custom_range") {
        $("#filter-date-input-group").show();
      } else {
        $("#filter-date-input-group").hide();
      }

      console.log(this.date_range_options[selection]);
      // TODO set filters etc.

    });

  }

  refresh() {
    this.build();
  }
}

export {DateFilter};