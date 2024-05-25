import {makeIssueLabelById} from '../../issue_label.js';
import {Component} from '../../main.js';
import {
  parking_duration_attributes as pda, 
  issue_attributes as ia,
  parking_time_date_format
} from '../../api_tools.js';
import {DateTime} from '../../../../libraries/luxon.min.js';

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
const OVERVIEW_DISPLAY_LIMIT = 5;

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

    // set callback that responds to router changes
    this.shared_state.router.onChange(() => {
      this.refresh();
    });

    this.#build();
  }

  refresh() {
    this.#build();
  }

  /**
   * Focus a submission in the submission list panel. 
   * - Applies CSS class to an item to give the feel of it being focused and scroll to it.
   * @param {Number} id ID of the submission to focus
   */
  #focusSubmission(id) {
    const elem = document.querySelector(
      `.submission-item[data-submission-id="${id}"]`
    );
    if (elem) {
      this.#unFocusSubmissions();
      elem.classList.add('focused');
      elem.scrollIntoView(true);
    }
  }

  #unFocusSubmissions() {
    const currentlyFocused = document.querySelectorAll(
      '.submission-item.focused'
    );
    currentlyFocused.forEach(elem => elem.classList.remove('focused'));
  }

  /**
   * Checks to see whether the url hash path is `#feed` and if the `view_all` param is 1
   * @returns {boolean}
   */
  #shouldViewAll() {
    const router = this.shared_state.router;
    return (
      router.params.get(PARAM_VIEW_ALL) === '1' &&
      router.currentRoute.path === 'feed'
    );
  }

  #buildTitle() {
    const titleSection = $(`<div class='title-section'>
      ${
        this.#shouldViewAll()
          ? '<a class="a-button" href="#feed">&#9666; Back</a>'
          : ''
      }
      <h2>Latest Submissions</h2>
      ${
        this.#shouldViewAll()
          ? ''
          : `<a class="a-button" href="#feed?${PARAM_VIEW_ALL}=1">View All</a>`
      }
    </div>`);

    return titleSection;
  }

  #applyFullView() {
    this.root.addClass(PARAM_VIEW_ALL);
  }

  #applyOverview() {
    this.root.removeClass(PARAM_VIEW_ALL);
  }

  /**
   * Adds event listeners to update hash router when a report in the feed is clicked
   */
  #enableClickToFocus() {
    const listing_items = document.querySelectorAll('.submission-item');
    listing_items.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        this.shared_state.router.params = new URLSearchParams({
          view_all: 1,
          submission_id: item.dataset.submissionId,
        });
        super.analytics_event(`${this.root_id}_focus_submission`, {
          submission_id: item.dataset.submissionId,
        });
      });
    });
  }

  #build() {
    this.root = $(`#${this.root_id}`);

    this.title = this.#buildTitle();
    this.root.empty().append(this.title);

    this.list = $('<div class="submission-list"></div>');
    this.root.append(this.list);

    const toDisplay = this.#getLatestSubmissions(
      this.#shouldViewAll() ? {} : {limit: OVERVIEW_DISPLAY_LIMIT}
    );

    this.#fillSubmissions(toDisplay);
    this.#enableClickToFocus();

    const submissionId = parseInt(
      this.shared_state.router.params.get('submission_id')
    );

    if (this.#shouldViewAll() && !isNaN(submissionId)) {
      this.#applyFullView();
      this.#focusSubmission(submissionId);
    } else if (this.#shouldViewAll()) {
      this.#applyFullView();
      // this.root[0].scroll(0, 0);
    } else {
      this.#applyOverview();
    }
  }

  /**
   * Sorts issues by render priority, then formats them as HTML. 
   * @param {string[]} issueIds 
   * @returns {string} formatted HTML for issues list
   * @requires issue_label.makeIssueLabel
   * @requires api_tools.issue_attributes
   */
  #issueIdsToLabels(issueIds) {
    return issueIds
      .sort((a, b) => ia[a].render_priority - ia[b].render_priority)
      .map(i => makeIssueLabelById(i, {long: false}))
      .join('');
  }

  #fillSubmissions(submissions) {
    this.list.empty();
    if (submissions.length === 0) {
      this.list.append(
        "<p class='no-data'>No submissions in selected range.<p>"
      );
    } else {
      for (const submission of submissions) {
        const parking_time = DateTime.fromFormat(
          submission.parking_time,
          parking_time_date_format,
          {zone: "America/Toronto"}
        );
        const parking_time_desc = parking_time.toLocaleString(
          DateTime.DATE_FULL, {locale: 'en-CA'}
        );
        const parking_time_time = parking_time.toLocaleString(
          DateTime.TIME_SIMPLE, {locale: 'en-CA'}
        );
        const html = `
          <a href='#' class="submission-item" 
            ${ATTR_DATA_SUBMISSION_ID}="${submission.id}"
          >
            <h3>${parking_time_desc}</h3>
            <p class="flex-distribute">
              <span>${parking_time.weekdayLong} • ${parking_time_time}</span>
              <span class="submission-id">ID: ${submission.id}</span>
            </p>
            <div class="problems">
              ${this.#issueIdsToLabels(submission.issues)}
            </div>
            <p><strong>Wanted to park for:</strong> ${
              pda[submission.parking_duration]?.description ?? 'unknown'
            }</p>
            ${
              submission.comments 
              ? `<p><strong>Comments:</strong> ${submission.comments}</p>` 
              : ''
            }
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
  #getLatestSubmissions({limit = null} = {}) {
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
}

export {Submissions};
