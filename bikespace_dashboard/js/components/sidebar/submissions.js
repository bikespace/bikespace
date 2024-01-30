import {Component} from '../main.js';

class Submissions extends Component {
  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('../main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);
    this.build();
  }

  build() {
    const content = 'meow';

    $(`#${this.root_id}`).empty().append(content);
  }

  refresh() {
    this.build();
  }
}

export {Submissions};
