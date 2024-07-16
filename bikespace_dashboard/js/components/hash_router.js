/**
 * @typedef {Object} Route
 * @property {string} name Human-friendly name of the route
 * @property {string} path Path of the route
 * @property {boolean} [default=false] If the route is the default route
 */

// regex and indexes for its capturing groups
const HASH_PATH_REGEX = /^#\/?([^?]+)(\?.+)?$/;
const PATH_INDEX = 1;
const PARAMS_STR_INDEX = 2;

class HashRouter {
  #callbacks = [];
  #currentRoute;
  #params;
  #routes;

  /**
   * Hash router reads, manipulates and provide source of truth of which "page" the app should be in based on the hash string
   * @param {Route[]} routes Routes the router should use.
   */
  constructor(routes) {
    this.#routes = routes;
    this.default = routes.find(r => r.default);
    if (!this.default) {
      throw new Error(
        'HashRouter routes must contain at least 1 default route.'
      );
    }

    window.addEventListener('hashchange', (e) => {
      this.refreshCurrent();
      this.executeCallbacks();
    });

    this.refreshCurrent();
  }

  resolvePath(path) {
    return this.#routes.find(r => r.path === path) ?? this.default;
  }

  refreshCurrent() {
    const matches = window.location.hash.match(HASH_PATH_REGEX) ?? [];
    this.#currentRoute = this.resolvePath(matches[PATH_INDEX]);
    this.#params = new URLSearchParams(matches[PARAMS_STR_INDEX] ?? '');
  }

  /**
   * @readonly {Route[]} The routes currently used in this HashRouter
   */
  get routes() {
    return this.#routes;
  }

  /**
   * @return {Route} The current route
   */
  get currentRoute() {
    return this.#currentRoute;
  }

  /**
   * Update hash router path and/or params
   * @param {string} path Path to navigate to
   * @param {URLSearchParams} params
   */
  push({path = null, params = null}) {
    path = path ?? this.#currentRoute.path;
    this.#params = params ?? new URLSearchParams();
    const paramStr = this.#params.toString();
    window.location.hash = path + (paramStr ? `?${paramStr}` : '');
  }

  /**
   * @readonly @returns {URLSearchParams} parameters found in the current hash route
   */
  get params() {
    return this.#params;
  }

  /**
   * @param {URLSearchParams} params Containing the params wished to be set
   */
  set params(params) {
    this.push({params});
  }

  setParam(name, value) {
    this.params.set(name, value);
    this.push({params: this.params});
  }

  getParam(name) {
    return this.params.get(name);
  }

  /**
   * @callback HashRouterOnChangeListener
   * @param {HashRouter} router The router executing this callback
   */

  /**
   * @param {HashRouterOnChangeListener} cb Callback to be execute when hash change
   */
  onChange(cb) {
    if (!this.#callbacks.includes(cb)) {
      this.#callbacks.push(cb);
    }
  }

  executeCallbacks() {
    for (const cb of this.#callbacks) {
      setTimeout(() => cb(), 0);
    }
  }
}

export default HashRouter;
