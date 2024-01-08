# BikeSpace Dashboard

Explore the live dashboard here: [dashboard.bikespace.ca/report](https://dashboard.bikespace.ca/)


## User Guide

Try clicking the charts to further filter the data shown on the map. Clicking on map clusters will show individual points, and clicking on individual points will bring up a tooltip showing the full details for that report.


## Contributing Guide

The BikeSpace project is developed and maintained by volunteers from [Civic Tech Toronto](http://civictech.ca/).

If you would like to request a filter or report a bug with the dashboard, please [open an issue](https://github.com/bikespace/bikespace-v2/issues) on this repository.

If you would like to add a feature or contribute a bugfix, please feel free to submit a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Please also reach out for help and advice via the [BikeSpace Civic Tech TO slack channel](https://civictechto.slack.com/archives/C61CZLA5V) or at one of the [Civic Tech TO Meetups](https://www.meetup.com/civic-tech-toronto/).


### Structure

The main page is `index.html` and the components of the dashboard (map, graphs, etc.) are loaded by `app.js`. The main stylesheet is `main.css`.

The individual component files can be found in `/js/components/`, including `main.js`, which includes the two base classes used to implement the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) to allow for cross-filtering between dashboard components: `Component` and `SharedState`.

The functional parts of the dashboard (e.g. the map, charts, etc.) subclass `Component`, which does two things:

* Append a div with `root_id` to the specified `parent` node (`parent` should be an unique JQuery selector, e.g. an id selector). This can then be used by the component to render its own content.
* Registers the component with the specified SharedState class.

The data and its relevant filters for the dashboard are managed by `SharedState`, which provides three main properties:

* `response_data` - full unfiltered data from the BikeSpace API
* `display_data` - user-filtered data shown by the various dashboard components
* `filters` - dict of filters to be applied for `display_data`. Each filter should be labeled by the value it is applied to and should have a `test` property which is a function that takes the labeled value from a row of the data and returns true or false.

When a `Component` sets or updates the value of `SharedState.filters`, `SharedState` will apply those filters to `SharedState.display_data` and call `.update()` on each `Component` registered to it. The `.update()` method for a component will usually re-request `SharedState.display_data` and update the component's content on the page accordingly.

Some components also use `SharedState.applyFilters()` to customize which filters are applied to the data used for rendering the component.

CSS stylesheets for individual components can be found in `/css/components` and have a similar structure to the `/js` folder. Component stylesheets are imported via `main.css`.


### Tools

The dashboard runs entirely in the user's browser, and does not use any major frameworks except for JQuery. Other tools are used to help create components, e.g.:

* Leaflet for the map
* Plotly JS for charts

The dashboard is deployed as a static page via CloudFlare (see repo Action `Deploy Dashboard`).

To develop the dashboard locally, you just need a simple local web server, e.g. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code or you can use [python's http.server](https://docs.python.org/3/library/http.server.html) (search for "invoked directly" to skip to the relevant instructions).