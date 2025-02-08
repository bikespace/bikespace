# BikeSpace Dashboard

Explore the live dashboard here: [dashboard.bikespace.ca](https://dashboard.bikespace.ca/)

## User Guide

Try clicking the charts or using the Filter pane to further filter the data shown on the map. Clicking on map clusters will show individual points, and clicking on individual points will bring up a tooltip showing the full details for that report. The Feed tab shows all reports (or filtered reports if a filter is applied) in reverse chronological order.

## Contributing Guide

The BikeSpace project is developed and maintained by volunteers from [Civic Tech Toronto](http://civictech.ca/).

If you would like to request a feature or report a bug with the dashboard, please [open an issue](https://github.com/bikespace/bikespace-v2/issues) on this repository.

If you would like to add a feature or contribute a bugfix, please feel free to submit a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Please also reach out for help and advice via the [BikeSpace Civic Tech TO slack channel](https://civictechto.slack.com/archives/C61CZLA5V) or at one of the [Civic Tech TO Meetups](https://www.meetup.com/civic-tech-toronto/).

### Tools

The dashboard runs entirely in the user's browser, and does not use any major frameworks except for JQuery. Other tools are used to help create components, e.g.:

- Leaflet for the map
- Plotly JS for charts
- Luxon for datetime values

The dashboard is deployed as a static page via CloudFlare (see repo Action `Deploy Dashboard`).

To develop the dashboard locally, you just need a simple local web server, e.g. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code or you can use [python's http.server](https://docs.python.org/3/library/http.server.html) (search for "invoked directly" to skip to the relevant instructions).

### Structure

The main page is `index.html` and the components of the dashboard (map, graphs, etc.) are loaded by `app.js`. The main stylesheet is `main.css`.

The individual component files can be found in `/js/components/`, including `main.js`, which includes the two base classes used to implement the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) to allow for cross-filtering between dashboard components: `Component` and `SharedState`. `main.js` also includes the `ReportFilter` class and subclasses used by components to apply filters to the data shown.

The functional parts of the dashboard (e.g. the map, charts, etc.) subclass `Component`, which does two things:

- Append a div with `root_id` to the specified `parent` node (`parent` should be an unique JQuery selector, e.g. an id selector). This can then be used by the component to render its own content.
- Registers the component with the specified SharedState class.

The data and its relevant filters for the dashboard are managed by `SharedState`, which provides three main properties:

- `response_data` - full unfiltered data from the BikeSpace API
- `display_data` - user-filtered data shown by the various dashboard components
- `filters` - dict of filters to be applied for `display_data`. Filters should be a subclass of `ReportFilter` imported from `main.js`.

When a `Component` sets or updates the value of `SharedState.filters`, `SharedState` will apply those filters to `SharedState.display_data` and call `.refresh()` on each `Component` registered to it. The `.refresh()` method for a component will usually re-request `SharedState.display_data` and update the component's content on the page accordingly.

Some components also use `SharedState.applyFilters()` to customize which filters are applied to the data used for rendering the component.

Additionally, the dashboard uses hash component of the URL to manage application state ("hash routing"). The hash component is the part of the url that comes after the [hash (number sign) character](https://en.wikipedia.org/wiki/Number_sign). This lets components change the state of the application without having to directly update the state of the other components. Given `window.location.hash`, the expected format is `#path?param=value`. Currently `path` maps to a tab found in the sidebar. The class `HashRouter`, accessible in `SharedState.router`, parses the hash url and exposes various methods to read and manipulate path and params.

CSS stylesheets for individual components can be found in `/css/components` and have a similar structure to the `/js` folder. Component stylesheets are imported via `main.css`. `template.css` contains non-layout styling, `stylevars.css` is used for style variables (e.g. colours, fonts, spacing units), and all the other component sheets are for component-specific styling. `main.css` also imports [Modern Normalize](https://github.com/sindresorhus/modern-normalize) to help keep styling development more predictable across browsers.

### More About Filters

Filters are created by sub-classing `ReportFilter` in `main.js`. Subclasses should take a "state" input (generally an arbitrary-length list of primitives or objects) and implement a "test" function that returns true or false for reports that should be included or excluded by that state.

For example to filter "all reports on Tuesdays", a component would create the filter with `new WeekDayPeriodFilter(["tuesday"])`, where `WeekDayPeriodFilter` is a subclass of `ReportFilter`. The subclass itself implements a test function to return true if the report's parking_time value is on a Tuesday (in Toronto's timezone).

The intended list of filters is below:

```
format: <filterKey> (<report value(s) used>) <example state>

id (id) ["id1", "id2"]
location (latitude, longitude) [{
  min_lat: 123,
  min_long: 123,
  max_lat: 123,
  max_long: 123,
}, ...]
issues (issues) ["issue1", "issue2"]
parking_duration (parking_duration) ["hours", "minutes"]
date_range (parking_time) [<luxon Interval>]
yearday_period (parking_time) [{min_day: 0, max_day: 5}, ...]
weekday_period (parking_time) ["monday", "wednesday"]
time_period (parking_time) [{min_time: <time>, max_time: <time>}]
comments (comments) ["search string 1", "search string 2"]
```

Most filters match 1:1 with one or more report values, but parking_time can be affected by several different overlapping filters:

- date_range, e.g. to implement filters such as "last 90 days" or "last year"
- yearday_period, e.g. to implement filters such as "reports in winter"
- weekday_period, e.g. to implement filters such as "reports on weekends"
- time_period, e.g. to implement filters such as "reports in the evening"

This system is pretty powerful, though there may still be cases where the dashboard is not the right tool, and a python script using a tool like [GeoPandas](https://geopandas.org/en/stable/docs.html) would be more appropriate, e.g.:

- "All reports within 100m of Queen St W", e.g. using `geopandas.GeoDataFrame.buffer()`
- "All reports after dusk" e.g. using some kind of external data source on dusk times throughout the year

### More About Hash Routing

This goes over how `HashRouter` is used and the components that use hash routing.

#### HashRouter usage

##### Initialization

The component `PanelNav` instantiates `HashRouter` by giving it the routes to use and then assign the instance to `shared_state.router`. It is always given a default path as fallback when the hash path is not as expected.

##### onChange listener

To listen for hash url change, component should pass a callback to the `.onChange` method. The first and only argument is the calling `HashRouter` instance.

##### Getting paths and params

See the `HashRouter` for details. All public methods have JSDoc attached.

#### PanelNav

`PanelNav` renders three tabs, `Data`, `Filter` and `Feed`. Each tab corresponds to a path.

`PanelNav` listens to hash URL changes and displays the corresponding tab.

When user clicks a tab, `PanelNav` does not call its internal method to render the corresponding tab. It calls `HashRouter.push` to change the hash url changes to `#tab` e.g. `#data` for the `Data` tab.

#### Feed

The feed listens to two params from the hash URL - `view_all` and `submission_id`. When `view_all` is `1` it displays all submissions as a scrollable list; when `submission_id` is a valid submission, it scrolls to and focuses the submission in the list.

#### Map

The map zooms to the submission marker and opens its info popup when the `Feed` tab is active and there is a submission id in the params.

There is also a "Focus in sidebar" link in the marker popup. This updates the hash router to indicate that the app should show the report corresponding with that marker in the `Feed` tab.

On mobile, marker details are always shown by updating the hash router so that the details are focused in the `Feed`, since there is not enough space to show the marker popup.

#### Filter

Filters currently do not read or manipulate the hash url. This may be added as a feature in the future.

### Development Tips

Some things to think about when writing components:

- coordination (via state) with other components that may affect the same filter
- ensure that the global clear filter works on the component
- avoid creating errors in cases when no data is returned
- whether the component needs to interact with the Hash Router
- ensure that any key interactions are included in analytics using `Component.prototype.analytics_event` or the proper [data attributes in links or buttons](https://umami.is/docs/track-events).
- [accessibility (A11y) testing](https://developer.mozilla.org/en-US/docs/Web/Accessibility), e.g. in the interaction options offered and colour selection
