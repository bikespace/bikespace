import { DateTime } from "../../libraries/luxon.min.js";

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
    console.log('display data', this._display_data);
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
    console.log(f); // DEBUG
    this._display_data = this.applyFilters(this._filters);
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
      let return_data = this.response_data;
      for (const [filterKey, reportFilter] of filter_list) {
        return_data = return_data.filter(r => reportFilter.test(r));
      }
      return return_data;
    } else {
      return this.response_data;
    }
  }

  get display_data() {
    return this._display_data;
  }
}

class Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   */
  constructor(parent, root_id, shared_state) {
    // register component
    this.root_id = root_id;
    this.shared_state = shared_state;
    this.root_key = root_id.replace('-', '_');
    shared_state.components[this.root_key] = this;

    // add to page
    $(parent).append(`<div id="${root_id}"></div>`);
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

class ReportFilter {
  filterKey = null;

  /**
   * Base class for report filters
   * @param {*[]} state
   */
  constructor(state) {
    if (!(state instanceof Array)) {
      throw new Error("ReportFilter state must be an Array");
    }
    this._state = state;
  }

  get state() {
    return this._state;
  }

  test(report) {
    // pass
  }

  stateEquals(otherState) {
    if (!(otherState instanceof Array)) return false;
    if (this._state.length !== otherState.length) return false;
    for (let i=0; i < this._state.length; i++) {
      if (!this.deepEquals(this._state[i], otherState[i])) return false;
    }
    return true;
  }

  deepEquals(x1, x2) {
    if (typeof x1 !== typeof x2) return false;
    if (typeof x1 === "object") {
      if (Object.keys(x1).length !== Object.keys(x2).length) return false;
      for (const key1 of Object.keys(x1)) {
        if (!(key1 in x2)) return false;
        if (x1[key1] !== x2[key1]) return false;
      }
      return true;
    } else {
      return x1 === x2;
    }
  }
}

class WeekDayPeriodFilter extends ReportFilter {
  filterKey = "weekday_period";
  #dayIndex = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7,
  };

  /**
   * Filter for weekday period (which days of the week to show)
   * @param {string[]} state Array of weekday names, e.g. ["saturday", "sunday"]
   */
  constructor (state) {
    super(state);
    this._state = this._state.map(x => x.toLowerCase());
  }

  test(report) {
    // Fri, 05 Jan 2024 09:22:06 GMT
    const dt = DateTime.fromFormat(
      report.parking_time,
      "EEE, dd MMM yyyy hh:mm:ss z",
      {zone: "America/Toronto"}
    );
    const inclWeekdays = this.state.map(x => this.#dayIndex[x]);
    return inclWeekdays.includes(dt.weekday);
  }
}

export {
  SharedState, 
  Component,
  WeekDayPeriodFilter,
};
