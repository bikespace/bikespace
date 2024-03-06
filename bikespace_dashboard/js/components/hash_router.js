/**
 * @typedef {Object} Route
 * @property {string} name Human-friendly name of the route
 * @property {string} path Path of the route
 * @property {boolean} [default=false] If the route is the default route
 */

const HASH_PATH_REGEX = /^#\/?([^?]+)(\?.+)?$/;

const PATH_INDEX = 1;

const PARAMS_STR_INDEX = 2;

class HashRouter {
  /**
   * Hash router reads, manipulates and provide source of truth of which "page" the app should be in based on the hash string
   * @param {Route[]} routes Routes the router should use.
   */
  constructor(routes) {
    this._routes = routes;
    this.default = routes.find(r => r.default);
    if (!this.default) {
      throw new Error(
        'HashRouter routes must contain at least 1 default route.'
      );
    }

    window.addEventListener('hashchange', () => {
      this.refreshCurrent();
      this.executeCallbacks();
    });
    this.refreshCurrent();

    this._callbacks = [];
  }

  resolvePath(path) {
    return this._routes.find(r => r.path === path) || this.default;
  }

  refreshCurrent() {
    const matches = window.location.hash.match(HASH_PATH_REGEX) || [];
    this._currentRoute = this.resolvePath(matches[PATH_INDEX]);
    this._params = new URLSearchParams(matches[PARAMS_STR_INDEX] || '');
  }

  /**
   * @readonly {Route[]} The routes currently used in this HashRouter
   */
  get routes() {
    return this._routes;
  }

  /**
   * @return {Route} The current route
   */
  get currentRoute() {
    return this._currentRoute;
  }

  /**
   *
   * @param {string} path Path to navigate to
   * @param {URLSearchParams} params
   */
  navigate(path, params = null) {
    this._params = params || new URLSearchParams();
    const paramStr = this._params.toString();
    window.location.hash = path + (paramStr ? `?${paramStr}` : '');
  }

  /**
   * @readonly @returns {URLSearchParams} parameters found in the current hash route
   */
  get params() {
    return this._params;
  }

  /**
   * @param {URLSearchParams} params Containing the params wished to be set
   */
  set params(params) {
    this.navigate(this.currentRoute, params);
  }

  /**
   * @callback HashRouterOnChangeListener
   * @param {HashRouter} router The router executing this callback
   */

  /**
   * @param {HashRouterOnChangeListener} cb Callback to be execute when hash change
   */
  onChange(cb) {
    if (!this._callbacks.includes(cb)) {
      this._callbacks.push(cb);
    }
  }

  executeCallbacks() {
    for (const cb of this._callbacks) {
      setTimeout(() => cb(), 0);
    }
  }
}

export default HashRouter;
