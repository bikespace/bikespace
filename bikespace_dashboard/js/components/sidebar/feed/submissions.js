import {makeIssueLabelById} from '../../issue_label.js';
import {Component} from '../../main.js';

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
 *
 * @typedef {import('../../main.js').ComponentOptions & _SCOnlyOptions} SubmissionsComponentOptions
 *
 */

const ATTR_DATA_SUBMISSION_ID = 'data-submission-id';

const PARAM_VIEW_ALL = 'view_all';

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
    this.shared_state.router.onChange(() => {
      this.refresh();
    });
    this.build();
  }

  shouldViewAll() {
    const router = this.shared_state.router;
    return (
      router.params.get(PARAM_VIEW_ALL) === '1' &&
      router.currentRoute.path === 'feed'
    );
  }

  buildTitle() {
    const titleSection = $(`<div class='title-section'>
      ${this.shouldViewAll() ? '<a href="#feed">&lsaquo;&lsaquo;</a>' : ''}
      <h2>Latest submissions</h2>
      ${
        this.shouldViewAll()
          ? ''
          : `<a href="#feed?${PARAM_VIEW_ALL}=1">View all</a>`
      }
    </div>`);

    const title = $(titleSection.children('h2')[0]);

    const styleToCopy = $('.gtitle');

    title.css('color', styleToCopy.css('fill'));
    title.css('font-family', styleToCopy.css('font-family'));
    title.css('font-size', styleToCopy.css('font-size'));
    title.css('font-weight', styleToCopy.css('font-weight'));
    title.css('margin', '0');
    title.css('margin-left', `${styleToCopy.attr('x')}px`);
    title.css('display', 'inline');
    return titleSection;
  }

  applyFullView() {
    this.root.addClass(PARAM_VIEW_ALL);
  }

  applyOverview() {
    this.root.removeClass(PARAM_VIEW_ALL);
  }

  enableClickToFocus() {
    // add event listeners to pan to item and open popup on click
    const listing_items = document.querySelectorAll('.submission-item');
    listing_items.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        this.shared_state.components.issue_map.zoomToSubmission(
          item.dataset.submissionId
        );
        this.shared_state.router.params = new URLSearchParams({
          view_all: 1,
          submission_id: item.dataset.submissionId,
        });
      });
    });
  }

  build() {
    this.root = $(`#${this.root_id}`);
    if (this.shouldViewAll()) {
      this.applyFullView();
      this.root[0].scroll(0, 0);
    } else {
      this.applyOverview();
    }

    this.title = this.buildTitle();
    this.root.empty().append(this.title);

    this.list = $('<div class="submission-list"></div>');
    this.root.append(this.list);

    const toDisplay = this.getLatestSubmissions(
      this.shouldViewAll() ? {} : {limit: 5}
    );

    this.fillSubmissions(toDisplay);
    this.enableClickToFocus();

    const submissionId = parseInt(
      this.shared_state.router.params.get('submission_id')
    );
    if (!isNaN(submissionId)) {
      this.focusSubmission(submissionId);
    }
  }

  issueIdsToLabels(issueIds) {
    return issueIds.map(i => makeIssueLabelById(i, {long: false})).join('');
  }

  fillSubmissions(submissions) {
    this.list.empty();
    if (submissions.length === 0) {
      this.list.append(
        "<p class='no-data'>No submissions in selected range.<p>"
      );
    } else {
      for (const submission of submissions) {
        const parking_time = new Date(submission.parking_time);
        const parking_time_desc = parking_time.toLocaleString('en-CA', {
          dateStyle: 'long',
          timeStyle: 'short',
        });
        const html = `<a href='#' class="submission-item" ${ATTR_DATA_SUBMISSION_ID}="${
          submission.id
        }">
            <h3>${parking_time_desc}</h3>
            <div class="problems">
              ${this.issueIdsToLabels(submission.issues)}
            </div>
            ${submission.comments ? `<p>${submission.comments}` : ''}</p>
          </a>`;
        this.list.append(html);
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
    const submissions = this.shared_state.display_data;
    if (!submissions[Symbol.iterator] || typeof submissions === 'string') {
      throw new Error('Submission data was corrupted');
    }
    // sorting submissions by id desc as a proxy for submission date
    submissions.sort((a, b) => b.id - a.id);
    if (typeof limit === 'number' && limit > 0) {
      return submissions.slice(0, limit);
    } else {
      return submissions;
    }
  }

  refresh() {
    this.build();
  }

  /**
   * Focus a submission in the submission list panel. Applies CSS class to an item to give the feel of it being focused and scroll to it.
   * @param {Number} id ID of the submission to focus
   */
  focusSubmission(id) {
    const currentlyFocused = document.querySelectorAll(
      '.submission-item.focused'
    );
    currentlyFocused.forEach(elem => elem.classList.remove('focused'));
    const elem = document.querySelector(
      `.submission-item[data-submission-id="${id}"]`
    );
    if (elem) {
      elem.classList.add('focused');
      elem.scrollIntoView();
    }
  }
}

export {Submissions};
