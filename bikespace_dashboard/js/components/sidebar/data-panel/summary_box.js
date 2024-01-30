import {Component} from '../../main.js';
import {DateTime} from "../../../../libraries/luxon.min.js";
import { parking_time_date_format } from '../../api_tools.js';

class SummaryBox extends Component {
  #entryCountDescription = "reports";
  #dateRangeDescription = "loading...";
  #entryCounter = "";

  /**
   * Summary box showing total number of reports and earliest and latest report dates
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);
    this.build();
  }

  build() {
    // Generate descriptions
    if (this.shared_state.display_data.length > 0) {
      // Entry Count Indicator
      this.#entryCounter = this.shared_state.display_data.length
        .toLocaleString('en-CA');

      // Entry Count Description
      if (Object.values(this.shared_state.filters).length > 0) {
        this.#entryCountDescription = "reports (filtered)";
      } else {
        this.#entryCountDescription = "reports";
      }

      // Date Range Description
      const submission_dates = this.shared_state.display_data.map(
        s => DateTime.fromFormat(
          s.parking_time,
          parking_time_date_format,
          {zone: "America/Toronto"}
        )
      );
      const earliest_entry = DateTime.min(...submission_dates);
      const latest_entry = DateTime.max(...submission_dates);

      this.#dateRangeDescription = `${
        earliest_entry.toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'})
      } – ${
        latest_entry.toLocaleString(DateTime.DATE_FULL, {locale: 'en-CA'},)
      }</div>`;

    } else {
      this.#entryCounter = `<img 
        src="./assets/exclamation-triangle.svg"
        alt="warning icon"
        />`;
      this.#entryCountDescription = "No reports match filter criteria";
      this.#dateRangeDescription = "Date Range N/A";
    }

    const content = [
      '<div class="entry-count-display">',
        `<span id="entry-count">${
          this.#entryCounter
        }</span>
        <span class="summary-desc"> </span>`,
        `<span id="entry-count-description" class="summary-desc">${
          this.#entryCountDescription
        }</span>`,
      '</div>',
      `<div class="summary-desc">${
        this.#dateRangeDescription
      }</div>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);
  }

  refresh() {
    this.build();
  }
}

export {SummaryBox};
