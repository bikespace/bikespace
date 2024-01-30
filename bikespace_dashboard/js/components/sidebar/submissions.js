import {Component} from '../main.js';

/**
 * @typedef {Object} Submission
 * @property {number} id
 * @property {Array[string]} issues
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} parking_time
 * @property {string} parking_duration
 * @property {string} comments
 */

/**
 *
 * @typedef {Object} _SCOnlyOptions
 * @property {boolean} [isOverview=false]
 *
 * @typedef {import('../main.js').ComponentOptions & _SCOnlyOptions} SubmissionsComponentOptions
 *
 */

class Submissions extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {SubmissionsComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);
    this.isOverview = options.isOverview;
    this.build();
  }

  buildTitle() {
    const title = $('<h2>Latest submissions</h2>');

    const styleToCopy = $('.gtitle');

    title.css('color', styleToCopy.css('fill'));
    title.css('font-family', styleToCopy.css('font-family'));
    title.css('font-size', styleToCopy.css('font-size'));
    title.css('font-weight', styleToCopy.css('font-weight'));
    title.css('margin-bottom', '0');
    title.css('margin-left', `${styleToCopy.attr('x')}px`);
    return title;
  }

  build() {
    this.root = $(`#${this.root_id}`);

    this.title = this.buildTitle();
    this.root.empty().append(this.title);

    this.list = $('<div></div>');
    this.root.append(this.list);

    const options = this.isOverview ? {limit: 20} : {};
    this.fillSubmissions(this.getLatestSubmissions(options));
  }

  fillSubmissions(submissions) {
    this.list.empty();
    if (submissions.length === 0) {
      this.list.append("<p class='no-data'>No submissions yet.<p>");
    } else {
      for (const submission of submissions) {
        this.list.append(
          `<div class="submission-item">
            <h3>${submission.parking_time}</h3>
            <p>Problems: ${submission.issues.join(', ')}</p>
          </div>`
        );
      }
    }
  }

  /**
   * Returns a list of submissions, sorted by time, descending
   * @param {Object} [options={}] options
   * @param {number | null} options.limit Number of submissions
   * @returns {Array[Submission]}
   */
  getLatestSubmissions({limit = null} = {}) {
    const submissions = this.shared_state.response_data;
    console.log('submissions', submissions);
    if (!submissions[Symbol.iterator] || typeof submissions === 'string') {
      // throw new Error('Submission data was corrupted');
      return [];
    }
    if (typeof limit === 'number' && limit > 0) {
      return submissions.slice(0, limit);
    } else {
      return submissions;
    }
  }

  refresh() {
    this.build();
  }
}

export {Submissions};
