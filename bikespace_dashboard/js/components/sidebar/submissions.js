import {makeIssueLabel, makeIssueLabelById} from '../issue_label.js';
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
    const titleSection = $(`<div>
      <h2>Latest submissions</h2>
      ${this.isOverview ? '<a href="#view-all">View all</a>' : ''}
    </div>`);

    const title = $(titleSection.children('h2')[0]);

    const styleToCopy = $('.gtitle');

    title.css('color', styleToCopy.css('fill'));
    title.css('font-family', styleToCopy.css('font-family'));
    title.css('font-size', styleToCopy.css('font-size'));
    title.css('font-weight', styleToCopy.css('font-weight'));
    title.css('margin-bottom', '0');
    title.css('margin-left', `${styleToCopy.attr('x')}px`);
    title.css('display', 'inline');
    return title;
  }

  build() {
    this.root = $(`#${this.root_id}`);

    this.title = this.buildTitle();
    this.root.empty().append(this.title);

    this.list = $('<div></div>');
    this.root.append(this.list);

    const options = this.isOverview ? {limit: 5} : {};
    this.fillSubmissions(this.getLatestSubmissions(options));

    // add event listeners to pan to item and open popup on click
    const listing_items = document.querySelectorAll('.submission-item');
    listing_items.forEach(item => {
      item.addEventListener('click', () => {
        const matching_marker = this.getMapMarkerByID(
          item.dataset.submissionId
        );
        this.shared_state.components.issue_map.markers.zoomToShowLayer(
          matching_marker,
          () => {
            matching_marker.openPopup();
          }
        );
      });
    });
  }

  issueIdsToLabels(issueIds) {
    return issueIds.map(i => makeIssueLabelById(i, {long: false})).join('');
  }

  fillSubmissions(submissions) {
    this.list.empty();
    if (submissions.length === 0) {
      this.list.append("<p class='no-data'>No submissions yet.<p>");
    } else {
      for (const submission of submissions) {
        this.list.append(
          `<div class="submission-item" data-submission-id="${submission.id}">
            <h3>${submission.parking_time}</h3>
            <div class="problems">
              ${this.issueIdsToLabels(submission.issues)}
            </div>
            ${submission.comments ? `<p>${submission.comments}` : ''}</p>
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
    // sorting submissions by id desc as a proxy for submission date
    submissions.sort((a, b) => b.id - a.id);
    if (typeof limit === 'number' && limit > 0) {
      return submissions.slice(0, limit);
    } else {
      return submissions;
    }
  }

  getMapMarkerByID(submission_id) {
    // convert strings to numbers if needed
    if (typeof submission_id !== 'number') {
      try {
        submission_id = Number(submission_id);
      } catch (error) {
        console.log('Wrong data type to look up marker by ID', error);
      }
    }
    return this.shared_state.components.issue_map.all_markers.filter(
      m => m.submission_id === submission_id
    )[0];
  }

  refresh() {
    this.build();
  }
}

export {Submissions};
