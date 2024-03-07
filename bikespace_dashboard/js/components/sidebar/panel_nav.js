import HashRouter from '../hash_router.js';
import {Component} from '../main.js';

const SECTION_ID_REGEX = /^.+-section-([a-zA-Z0-9]+)/;

const sectionIdToTabId = sectionId => {
  return sectionId.match(SECTION_ID_REGEX)[1];
};

/** @type {import('../hash_router.js').Route[]} */
const TABS = [
  {
    name: 'Data',
    path: 'data',
    default: true,
  },
  {
    name: 'Filters',
    path: 'filters',
  },
  {
    name: 'Feed',
    path: 'feed',
  },
];

class PanelNav extends Component {
  /**
   * Panel navigation and filter clear button
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {import('../main.js').SharedState} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    shared_state.router = new HashRouter(TABS);

    shared_state.router.onChange(() => {
      this.maybeChangeTab();
    });

    // add content to page
    document.querySelector(`#${this.root_id}`).insertAdjacentHTML(
      'afterbegin',
      `<div id="${root_id}-header">
        <nav id="${root_id}-nav" aria-label="Sidebar">
          <fieldset>
            ${TABS.map(
              t => `
              <input type="radio" id="${root_id}-nav-${t.path}" name="${root_id}-nav" value="${root_id}-section-${t.path}">
              <label for="${root_id}-nav-${t.path}">${t.name}</label>
            `
            ).join('')}
          </fieldset>
        </nav>
        <button class="clear-filter"
          type="button" 
          hidden 
          data-umami-event="clear-filters"
        >
          <img src="assets/clear-filter.svg"/> Clear Filters
        </button>
      </div>
      <div id="${root_id}-sections">
      ${TABS.map(
        t => `
        <div id="${root_id}-section-${t.path}" 
          class="${root_id}-section"
          ${t.default ? '' : 'hidden'}
          >
        </div>
      `
      ).join('')}
      </div>`
    );
    document
      .querySelector(`#${root_id}-nav`)
      .addEventListener('click', event => {
        if (event.target?.matches('input[type="radio"]')) {
          this.shared_state.router.push({
            path: sectionIdToTabId(event.target.value),
          });
        }
      });

    $(`#${this.root_id} button.clear-filter`).on('click', () => {
      this.shared_state.filters = {};
    });

    this.maybeChangeTab();
  }

  switchNavToCurrent() {
    const currentTab = this.shared_state.router.currentRoute.path;
    document
      .querySelectorAll(`#${this.root_id} input[type="radio"]`)
      .forEach(input => {
        input.checked = false;
      });
    document.getElementById(`${this.root_id}-nav-${currentTab}`).checked = true;
  }

  showCurrentTabContent() {
    const currentTab = this.shared_state.router.currentRoute.path;
    document.querySelectorAll(`.${this.root_id}-section`).forEach(section => {
      section.hidden = true;
    });
    document.getElementById(`${this.root_id}-section-${currentTab}`).hidden =
      false;
  }

  maybeChangeTab() {
    this.switchNavToCurrent();
    this.showCurrentTabContent();
  }

  refresh() {
    this.maybeChangeTab();
    if (Object.values(this.shared_state.filters).length > 0) {
      $(`#${this.root_id} button.clear-filter`).removeAttr('hidden');
    } else {
      $(`#${this.root_id} button.clear-filter`).attr('hidden', true);
    }
  }
}

export {PanelNav};
