import {Component} from '../main.js';

const HASH_PATH_REGEX = /^#\/?([^?]+)\??/;

const SECTION_ID_REGEX = /^.+-section-([a-zA-Z0-9]+)/;

const sectionIdToTabId = sectionId => {
  return sectionId.match(SECTION_ID_REGEX)[1];
};

const DEFAULT_TAB = 'data';

class PanelNav extends Component {
  /**
   * Panel navigation and filter clear button
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    window.addEventListener('hashchange', () => {
      this.refresh();
    });

    // add content to page
    document.querySelector(`#${this.root_id}`).insertAdjacentHTML(
      'afterbegin',
      `<div id="${root_id}-header">
        <nav id="${root_id}-nav" aria-label="Sidebar">
          <fieldset>
              <input type="radio" id="${root_id}-nav-data" name="${root_id}-nav" value="${root_id}-section-data">
              <label for="${root_id}-nav-data">Data</label>
              <input type="radio" id="${root_id}-nav-filters" name="${root_id}-nav" value="${root_id}-section-filters">
              <label for="${root_id}-nav-filters">Filters</label>
              <input type="radio" id="${root_id}-nav-feed" name="${root_id}-nav" value="${root_id}-section-feed">
              <label for="${root_id}-nav-feed">Feed</label>
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
        <div id="${root_id}-section-data" 
          class="${root_id}-section"
        ></div>
        <div id="${root_id}-section-filters" 
          class="${root_id}-section" 
          hidden
        ></div>
        <div id="${root_id}-section-feed" 
          class="${root_id}-section" 
          hidden
        ></div>
      </div>`
    );
    document
      .querySelector(`#${root_id}-nav`)
      .addEventListener('click', event => {
        if (event.target?.matches('input[type="radio"]')) {
          this.switchTab(sectionIdToTabId(event.target.value));
        }
      });

    $(`#${this.root_id} button.clear-filter`).on('click', () => {
      this.shared_state.filters = {};
    });

    this.maybeChangeTab();
  }

  getCurrentTab() {
    const matches = location.hash.match(HASH_PATH_REGEX);
    return (matches && matches[1]) || DEFAULT_TAB;
  }

  switchTab(id) {
    window.location.hash = id;
  }

  switchNavToCurrent() {
    const currentTab = this.getCurrentTab();
    document
      .querySelectorAll(`#${this.root_id} input[type="radio"]`)
      .forEach(input => {
        input.checked = false;
      });
    document.getElementById(`${this.root_id}-nav-${currentTab}`).checked = true;
  }

  showCurrentTabContent() {
    const currentTab = this.getCurrentTab();
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
