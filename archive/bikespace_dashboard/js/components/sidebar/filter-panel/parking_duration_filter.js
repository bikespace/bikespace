import {Component, ParkingDurationFilter} from '../../main.js';
import {parking_duration_attributes as pda} from '../../api_tools.js';

class ParkingDurationFilterControl extends Component {
  #selection = {};

  /**
   * Creates a parking duration filter control
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    // set all checkboxes as selected
    for (const duration of Object.values(pda)) {
      this.#selection[duration.id] = true;
    }

    this.build();
  }

  build() {
    const duration_checkboxes = ['<div>'];
    for (const [id, selected] of Object.entries(this.#selection)) {
      duration_checkboxes.push(
        `<div>
          <input 
            type="checkbox" 
            id="filter-parking-duration-${id}" 
            name="${id}"
            class="filter-parking-duration-input"
            ${selected ? 'checked' : ''}
          >
          <label for="filter-parking-duration-${id}">
            ${pda[id].description}
          </label>
        </div>`
      );
    }
    duration_checkboxes.push('</div>');

    const content = [
      '<details open>',
      '<summary>Parking Duration</summary>',
      '<div class="details-container">',
      '<div class="parking-duration-types">',
      `<button 
              class="filter-parking-duration-type" 
              type="button"
              data-type="short-term"
            >
              Short-Term
            </button>`,
      `<button 
              class="filter-parking-duration-type" 
              type="button"
              data-type="long-term"
            >
              Long-Term
            </button>`,
      '</div>',
      ...duration_checkboxes,
      '</div>',
      '</details>',
    ].join('');

    $(`#${this.root_id}`).empty().append(content);

    $('.filter-parking-duration-input').on('change', e => {
      const checkboxes = document.querySelectorAll(
        '.filter-parking-duration-input'
      );
      const state = [];
      for (const checkbox of checkboxes) {
        if (checkbox.checked) state.push(checkbox.name);
      }
      this.setFilter(state);
    });

    $('.filter-parking-duration-type').on('click', e => {
      const duration_type = e.target.dataset.type;
      const state = [];
      for (const duration of Object.values(pda)) {
        if (duration.type === duration_type) {
          state.push(duration.id);
        }
      }
      this.setFilter(state);
    });
  }

  setFilter(state) {
    const filters = this.shared_state.filters;
    if (state) {
      filters[ParkingDurationFilter.filterKey] = new ParkingDurationFilter(
        state
      );
      for (const duration of Object.values(pda)) {
        this.#selection[duration.id] = state.includes(duration.id);
      }
    } else {
      delete filters[ParkingDurationFilter.filterKey];
      for (const duration of Object.values(pda)) {
        this.#selection[duration.id] = true;
      }
    }
    super.analytics_event(this.root_id, filters);
    this.shared_state.filters = filters;
  }

  refresh() {
    // handle global filter clear
    if (!this.shared_state.filters[ParkingDurationFilter.filterKey]) {
      for (const duration of Object.values(pda)) {
        this.#selection[duration.id] = true;
      }
    }
    for (const [id, selected] of Object.entries(this.#selection)) {
      document.getElementById(`filter-parking-duration-${id}`).checked =
        selected;
    }
  }
}

export {ParkingDurationFilterControl};
