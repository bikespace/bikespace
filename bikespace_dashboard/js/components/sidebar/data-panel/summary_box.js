import {Component} from '../../main.js';
import {DateTime} from "../../../../libraries/luxon.min.js";
import { parking_time_date_format } from '../../api_tools.js';

class SummaryBox extends Component {
  /**
   * Summary box showing total number of reports and earliest and latest report dates
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   */
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);
    this.build();
  }

  build() {
    // Calculate date range of entries
    const submission_dates = this.shared_state.display_data.map(
      s => DateTime.fromFormat(
        s.parking_time,
        parking_time_date_format,
        {zone: "America/Toronto"}
      )
    );
    const earliest_entry = DateTime.min(...submission_dates);
    const latest_entry = DateTime.max(...submission_dates);

    const content = [
      '<div>',
        `<span id="entry-count">${
          this.shared_state.display_data.length.toLocaleString('en-CA')
        }</span>`,
        '<span class="summary-desc"> Reports</span>',
      '</div>',
      `<div class="summary-desc">${earliest_entry.toLocaleString(
        DateTime.DATE_FULL, 
        {locale: 'en-CA'},
      )} – ${latest_entry.toLocaleString(
        DateTime.DATE_FULL, 
        {locale: 'en-CA'},
        )}</div>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);
  }

  refresh() {
    this.build();
  }
}

export {SummaryBox};
