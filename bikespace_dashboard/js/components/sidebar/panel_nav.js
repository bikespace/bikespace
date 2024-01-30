import { Component } from "../main.js";

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

    // add content to page
    document.querySelector(`#${this.root_id}`).insertAdjacentHTML(
      'afterbegin',
        `<div id="${root_id}-header">
          <nav id="${root_id}-nav" aria-label="Sidebar">
            <fieldset>
                <input type="radio" id="${root_id}-nav-data" name="${root_id}-nav" value="${root_id}-section-data" checked>
                <label for="${root_id}-nav-data">Data</label>
                <input type="radio" id="${root_id}-nav-filters" name="${root_id}-nav" value="${root_id}-section-filters">
                <label for="${root_id}-nav-filters">Filters</label>
                <input type="radio" id="${root_id}-nav-feed" name="${root_id}-nav" value="${root_id}-section-feed" hidden>
                <label for="${root_id}-nav-feed" hidden>Feed</label>
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
          document.querySelectorAll(`.${root_id}-section`).forEach(section => {
            section.hidden = true;
          });
          document.getElementById(`${event.target.value}`).hidden = false;
        }
      });

    $(`#${this.root_id} button.clear-filter`).on('click', () => {
      this.shared_state.filters = {};
    });
  }

  refresh() {
    if (Object.values(this.shared_state.filters).length > 0) {
      $(`#${this.root_id} button.clear-filter`).removeAttr('hidden');
    } else {
      $(`#${this.root_id} button.clear-filter`).attr('hidden', true);
    }
  }
}

export {PanelNav};
