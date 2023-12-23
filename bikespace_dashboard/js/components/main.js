/**
 * Shared state class - handles shared data, filtering, and refresh when filters are updated.
 */
class SharedState {
  constructor(data) {
    this.components = {}

    this.response_data = data.submissions;
    // Data initially not filtered
    this.display_data = data.submissions;
    console.log("display data", this.display_data);
  }

  refresh() {
    for(const module of Object.values(this.components)) {
      module.refresh();
    }
  }

  set filters(f) {
    this.filters = f;
    this.refresh();
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
        this.root_key = root_id.replace("-", "_");
        shared_state.components[this.root_key] = this;

        // add to page
        $(parent).append(`<div id="${root_id}"></div>`);
  }
}

export { SharedState, Component };