/**
 * Shared state class - handles shared data, filtering, and refresh when filters are updated.
 * Note: _display_data is currently not modified within this class, but may be in the future, e.g. to remove irrelevant (e.g. test, spam) entries.
 */
class SharedState {
  constructor(data) {
    this.components = {};
    this._filters = {};

    this.response_data = data.submissions;
    // Data initially not filtered
    this._display_data = data.submissions;
  }

  refresh() {
    for (const module of Object.values(this.components)) {
      module.refresh();
    }
  }

  get filters() {
    return this._filters;
  }

  set filters(f) {
    this._filters = f;
    // console.log(f); // DEBUG
    this.refresh();
  }

  /**
   * Can be called with custom filters object in case there are visuals where applying all the current filters is not desired
   * @param {obj} filters
   * @returns filtered data
   */
  applyFilters(filters) {
    const filter_list = Object.entries(filters);
    if (filter_list.length > 0) {
      let return_data = this._display_data;
      for (const [property, filter] of filter_list) {
        return_data = return_data.filter(r => filter.test(r[property]));
      }
      return return_data;
    } else {
      return this._display_data;
    }
  }

  get display_data() {
    return this.applyFilters(this.filters);
  }
}

/**
 * @typedef {Object} ComponentOptions
 * @property {String} [className=''] Additional class names for the component
 */

class Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, {className = ''} = {}) {
    // register component
    this.root_id = root_id;
    this.shared_state = shared_state;
    this.root_key = root_id.replace('-', '_');
    shared_state.components[this.root_key] = this;

    // add to page
    $(parent).append(`<div id="${root_id}" class="${className}"></div>`);
  }

  refresh() {
    //pass
  }

  analytics_event(event_name, data) {
    try {
      if (data !== undefined) {
        umami.track(event_name, data);
      } else {
        umami.track(event_name);
      }
    } catch (error) {
      console.log(
        `Analytics not active to track "${event_name}"`,
        data ?? null
      );
    }
  }
}

export {SharedState, Component};
