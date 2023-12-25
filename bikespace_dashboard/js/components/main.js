/**
 * Shared state class - handles shared data, filtering, and refresh when filters are updated.
 */
class SharedState {
  constructor(data) {
    this.components = {};
    this._filters = {};

    this.response_data = data.submissions;
    // Data initially not filtered
    this._display_data = data.submissions;
    console.log("display data", this._display_data);
  }

  refresh() {
    for(const module of Object.values(this.components)) {
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

  get display_data() {
    let filter_list = Object.entries(this._filters);
    if (filter_list.length > 0) {
      let return_data = this._display_data;
      for (let [property, filter] of filter_list) {
        return_data = return_data.filter((r) => filter.test(r[property]));
      }
      return return_data;
    } else {
      return this._display_data;
    }
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
        this.root_key = root_id.replace("-", "_");
        shared_state.components[this.root_key] = this;

        // add to page
        $(parent).append(`<div id="${root_id}"></div>`);
  }

  refresh() {
    //pass
  }
}

export { SharedState, Component };