import {Component} from '../../main.js';

class SummaryBox extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
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
      s => new Date(s.parking_time)
    );
    const earliest_entry = submission_dates.reduce((p, c) => (p < c ? p : c));
    const latest_entry = submission_dates.reduce((p, c) => (p > c ? p : c));

    // Date formatting
    const date_options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const content = [
      '<div class="flex">',
      `<div id="entry-count">${this.shared_state.display_data.length.toLocaleString(
        'en-CA'
      )}</div>`,
      '<button class="clear-filter" type="button" hidden data-umami-event="clear-filters"><img src="assets/clear-filter.svg"/> Clear Filters</button>',
      '</div>',
      '<div class="summary-desc">Total Reports</div>',
      `<div class="summary-desc">${earliest_entry.toLocaleDateString(
        'en-CA',
        date_options
      )} – ${latest_entry.toLocaleDateString('en-CA', date_options)}</div>`,
    ].join('');

    $(`#${this.root_id}`).empty().append(content);

    $(`#${this.root_id} button.clear-filter`).on('click', () => {
      this.shared_state.filters = {};
    });

    if (Object.values(this.shared_state.filters).length > 0) {
      $(`#${this.root_id} button.clear-filter`).removeAttr('hidden');
    }
  }

  refresh() {
    this.build();
  }
}

export {SummaryBox};
