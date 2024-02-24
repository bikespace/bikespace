import {Component, DateRangeFilter} from '../../main.js';
import {DateTime, Interval} from '../../../../libraries/luxon.min.js';
import {parking_time_date_format} from '../../api_tools.js';

class DateFilterControl extends Component {
  /**
   * Creates a date filter control with pre-set ranges
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   */
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Calculate date range for all data
    const all_dates = this.shared_state.response_data.map(
      s => DateTime.fromFormat(
        s.parking_time,
        parking_time_date_format,
        {zone: "America/Toronto"}
      )
    );
    this.earliest_all = DateTime.min(...all_dates);
    this.latest_all = DateTime.max(...all_dates);
    const today = DateTime.now().setZone("America/Toronto");

    // TODO validate the date ranges make sense

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

    this._selection = "all_dates";
    this.updateDisplayRange();
    this.build();
  }

  build() {
    const content = [
      `<h3>Date(s):</h3>`,
      `<div id="filter-date-range-indicator" class="">`,
        this.buildDateRangeIndicator(),
      `</div>`,
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
            value="${this.earliest_display.toISODate()}"
            min="${this.earliest_all.toISODate()}"
            max="${this.latest_all.toISODate()}"
          />`,
        `</div>`,
        `<div class="date-input">`,
          `<label for="filter-end-date">End date:</label>`,
          `<input 
            type="date" 
            id="filter-end-date" 
            name="end-date" 
            value="${this.latest_display.toISODate()}"
            min="${this.earliest_all.toISODate()}"
            max="${this.latest_all.toISODate()}"
          />`,
        `</div>`,
        `<div>`,
          `<button id="filter-date-input-apply" type="button">Apply</button>`,
        `</div>`,
      `</div>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);

    $("#filter-date-range-select").on('change', (e) => {
      this._selection = e.target.value;

      // show or hide custom date picker
      if (this._selection === "custom_range") {
        $("#filter-date-input-group").show();
        return;
      } else {
        $("#filter-date-input-group").hide();
      }

      const selected_range = this.date_range_options[this._selection];
      // console.log(selected_range);
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
   * Generates text indicating filter date range
   * @returns {string}
   */
  buildDateRangeIndicator() {
    const selected_range = this.date_range_options[this._selection];
    const rangeStart = (selected_range.interval?.start ?? this.earliest_display)
      .toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});
    const rangeEnd = (selected_range.interval?.end ?? this.latest_display)
      .toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'});

    return `${rangeStart} – ${rangeEnd}`;
  }

  /**
   * set filter for date range
   * @param {<Interval>} interval 
   */
  setFilter(interval) {
    const filters = this.shared_state.filters;
    if (interval) {
      filters.date_range = new DateRangeFilter([interval]);
    } else {
      delete filters.date_range;
    }
    super.analytics_event(this.root_id, filters);
    this.shared_state.filters = filters;
  }


  /**
   * Update date range of displayed (globally filtered) entries
   */
  updateDisplayRange() {
    const display_dates = this.shared_state.display_data.map(
      s => DateTime.fromFormat(
        s.parking_time,
        parking_time_date_format,
        {zone: "America/Toronto"}
      )
    );
    this.earliest_display = DateTime.min(...display_dates);
    this.latest_display = DateTime.max(...display_dates);
  }

  refresh() {
    this.updateDisplayRange();
    $("#filter-date-range-indicator").text(this.buildDateRangeIndicator());
  }
}

export {DateFilterControl};