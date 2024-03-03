import {Component, DateRangeFilter} from '../../main.js';
import {DateTime, Interval} from '../../../../libraries/luxon.min.js';
import {parking_time_date_format} from '../../api_tools.js';

class DateFilterControl extends Component {
  #earliestSelection;
  #latestSelection;
  #earliestAll;
  #latestAll;
  #selection;

  /**
   * Creates a date filter control with pre-set ranges
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    // Calculate date range for all data
    const all_dates = this.shared_state.response_data.map(
      s => DateTime.fromFormat(
        s.parking_time,
        parking_time_date_format,
        {zone: "America/Toronto"}
      )
    );
    this.#earliestAll = DateTime.min(...all_dates);
    this.#latestAll = DateTime.max(...all_dates);
    this.#earliestSelection = this.#earliestAll;
    this.#latestSelection = this.#latestAll;
    const today = DateTime.now().setZone("America/Toronto");

    this.date_range_options = {
      "all_dates": {
        "label": "All Dates",
        "group": 0,
        "interval": null,
      },
      "last_7_days": {
        "label": "Last 7 Days",
        "group": 1,
        "interval": Interval.fromDateTimes(today.minus({days: 7 - 1}), today),
      },
      "last_30_days": {
        "label": "Last 30 Days",
        "group": 1,
        "interval": Interval.fromDateTimes(today.minus({days: 30 - 1}), today),
      },
      "last_90_days": {
        "label": "Last 90 Days",
        "group": 1,
        "interval": Interval.fromDateTimes(today.minus({days: 90 - 1}), today),
      },
      // last 11 full months plus the current month which may be incomplete
      "last_12_months": {
        "label": "Last 12 Months",
        "group": 2,
        "interval": Interval.fromDateTimes(
          today.minus({months: 12 - 1}).startOf("month"),
          today.endOf("month"),
          ),
      },
      "this_year": {
        "label": "This Year",
        "group": 2,
        "interval": Interval.fromDateTimes(
          today.startOf("year"),
          today.endOf("year"),
        ),
      },
      "last_year": {
        "label": "Last Year",
        "group": 2,
        "interval": Interval.fromDateTimes(
          today.minus({years: 1}).startOf("year"),
          today.minus({years: 1}).endOf("year"),
        ),
      },
      "custom_range": {
        "label": "Custom Range",
        "group": 3,
        "interval": null,
      },
    };

    this.#selection = "all_dates";
    this.build();
  }

  build() {
    const content = [
      `<details open>`,
        `<summary>Date Range</summary>`,
        `<div class="details-container">`,
          `<div class="filter-section">`,
            `<div><strong>Showing between:</strong></div>`,
            `<div id="filter-date-range-indicator" class="">`,
              `${this.#earliestSelection.toLocaleString(
                DateTime.DATE_FULL, {locale: 'en-CA'}
              )} – ${this.#latestSelection.toLocaleString(
                DateTime.DATE_FULL, {locale: 'en-CA'}
              )}`,
            `</div>`,
          `</div>`,
          `<div class="filter-section">`,
            `<div class="filter-section-item">`,
              `<label for="filter-date-range-select">
                <strong>Select:</strong>
              </label>`,
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
            `</div>`,
            `<div class="date-input-group" id="filter-date-input-group" hidden>`,
              `<div class="date-input filter-section-item">`,
                `<label for="filter-start-date">Start date:</label>`,
                `<input 
                  type="date" 
                  id="filter-start-date" 
                  name="start-date" 
                  value="${this.#earliestSelection.toISODate()}"
                  min="${this.#earliestAll.toISODate()}"
                  max="${this.#latestAll.toISODate()}"
                />`,
              `</div>`,
              `<div class="date-input filter-section-item">`,
                `<label for="filter-end-date">End date:</label>`,
                `<input 
                  type="date" 
                  id="filter-end-date" 
                  name="end-date" 
                  value="${this.#latestSelection.toISODate()}"
                  min="${this.#earliestAll.toISODate()}"
                  max="${this.#latestAll.toISODate()}"
                />`,
              `</div>`,
              `<div class="filter-section-item">`,
                `<button id="filter-date-input-apply" type="button">Apply</button>`,
              `</div>`,
            `</div>`,
          `</div>`,
        `</div>`,
      `</details>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);

    $("#filter-date-range-select").on('change', (e) => {
      this.#selection = e.target.value;
      this.toggleCustomDatePicker();
      
      // update filter unless custom date picker opened
      if (this.#selection === "custom_range") return;
      const selected_range = this.date_range_options[this.#selection];
      this.setFilter(selected_range.interval);
    });

    $("#filter-date-input-apply").on('click', (e) => {
      const start_date = $("#filter-start-date").val();
      const end_date = $("#filter-end-date").val();
      const interval = Interval.fromDateTimes(
        DateTime.fromISO(start_date, {zone: "America/Toronto"}),
        DateTime.fromISO(end_date, {zone: "America/Toronto"}),
      )
      this.setFilter(interval);
    });
  }
  
  /**
   * Show or hide custom date picker
   */
  toggleCustomDatePicker() {
    if (this.#selection === "custom_range") {
      $("#filter-date-input-group").show();
    } else {
      $("#filter-date-input-group").hide();
    }
  }

  /**
   * Update UI indicating selected range
   */
  updateSelectedRangeUI() {
    $("#filter-date-range-indicator").text(
      `${this.#earliestSelection.toLocaleString(
        DateTime.DATE_FULL, {locale: 'en-CA'}
      )} – ${this.#latestSelection.toLocaleString(
        DateTime.DATE_FULL, {locale: 'en-CA'}
      )}`
    );
    $("#filter-start-date").val(this.#earliestSelection.toISODate());
    $("#filter-end-date").val(this.#latestSelection.toISODate());
  }

  /**
   * set filter for date range
   * @param {<Interval>} interval 
   */
  setFilter(interval) {
    const filters = this.shared_state.filters;
    if (interval) {
      filters.date_range = new DateRangeFilter([interval]);
      this.#earliestSelection = interval.start;
      this.#latestSelection = interval.end;
    } else {
      delete filters.date_range;
      this.#earliestSelection = this.#earliestAll;
      this.#latestSelection = this.#latestAll;
      this.#selection = "all_dates";
    }
    super.analytics_event(this.root_id, filters);
    this.shared_state.filters = filters;
  }

  refresh() {
    // handle global filter clear
    if (!this.shared_state.filters.date_range) {
      this.#earliestSelection = this.#earliestAll;
      this.#latestSelection = this.#latestAll;
      this.#selection = "all_dates";
      $("#filter-date-range-select").val(this.#selection);
      this.toggleCustomDatePicker();
    }
    this.updateSelectedRangeUI();
  }
}

export {DateFilterControl};