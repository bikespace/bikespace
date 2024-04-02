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
  static CLASS_CLOSED = 'closed';

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

    const tabNavsHTML = TABS.map(
      t => `
        <input type="radio" id="${root_id}-nav-${t.path}" name="${root_id}-nav" value="${root_id}-section-${t.path}">
        <label for="${root_id}-nav-${t.path}">${t.name}</label>
            `
    ).join('');

    const tabContentsHTML = TABS.map(
      t => `
        <div id="${root_id}-section-${t.path}" 
          class="${root_id}-section"
          ${t.default ? '' : 'hidden'}
          >
        </div>
      `
    ).join('');

    // add content to page
    const root_elem = document.querySelector(`#${this.root_id}`);
    this.drawerHandle = this.makeDrawerHandle();
    const {defaultClosed = true} = options;
    defaultClosed ? this.close() : this.open();

    root_elem.insertAdjacentElement('beforeend', this.drawerHandle);
    root_elem.insertAdjacentHTML(
      'beforeend',
      `<div id="${root_id}-header">
        <nav id="${root_id}-nav" aria-label="Sidebar">
          <fieldset>
            ${tabNavsHTML}
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
        ${tabContentsHTML}
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

  isClosed() {
    return this.getRootElem().classList.contains(PanelNav.CLASS_CLOSED);
  }

  toggle() {
    this.setIsHandleClosed(!this.isClosed());
  }

  close() {
    this.setIsHandleClosed(true);
  }

  open() {
    this.setIsHandleClosed(false);
  }

  setIsHandleClosed(isClosed) {
    if (isClosed) this.getRootElem().classList.add(PanelNav.CLASS_CLOSED);
    else this.getRootElem().classList.remove(PanelNav.CLASS_CLOSED);
    this.drawerHandle.ariaPressed = !isClosed;
  }

  makeDrawerHandle() {
    const handleButton = document.createElement('button');
    handleButton.classList.add('drawer-handle');
    handleButton.addEventListener('click', () => {
      this.toggle();
    });
    return handleButton;
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
