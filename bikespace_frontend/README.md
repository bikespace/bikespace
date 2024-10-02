# BikeSpace Frontend

The BikeSpace frontend is React application written in TypeScript. [NextJS](https://nextjs.org/) is utilized to serve it as a static site.


## Running the frontend application

Running the frontend:
```shell
make dev-frontend
```

The development frontend server should be running at `localhost:8080`

Testing the frontend:
```shell
make test-frontend
```

Linting (first option shows suggested changes, second option automatically edits):
```shell
make lint-frontend
make lint-and-fix-frontend
```


## Contributing Guide

The BikeSpace project is developed and maintained by volunteers from [Civic Tech Toronto](http://civictech.ca/).

If you would like to request a feature or report a bug with the dashboard, please [open an issue](https://github.com/bikespace/bikespace/issues) on this repository.

If you would like to add a feature or contribute a bugfix, please feel free to submit a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Please also reach out for help and advice via the [BikeSpace Civic Tech TO slack channel](http://link.civictech.ca/slack) or at one of the [Civic Tech TO Meetups](https://www.meetup.com/civic-tech-toronto/).


## Overall Structure

Frontend code can be found in the `/src` folder, organized as follows:

- `/app` - contains the page structure and [`mdx`](https://mdxjs.com/) content
- `/assets` - images, icons, fonts
- `/components` - `jsx` components each have their own folder that contains the component's code, stylesheet, and tests (if applicable)
- `/config` - commonly used constants
- `/hooks` - custom React hooks
- `/interfaces` - shared Typescript [Object types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- `/styles` - top level stylesheets (component-specific stylesheets are in `/components`)
- `/utils` - utility functions (e.g. for analytics)


To better understand how the app is organized, we highly recommend you read the [routing docs for NextJS](https://nextjs.org/docs/app/building-your-application/routing).


## Notes on Dashboard Structure

- `dynamic` is used for lazy loading, see: https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic
- `react-query` is used to manage getting data from the API, see: https://tanstack.com/query/latest/docs/framework/react/overview
  - This requires wrapping the page layout (src/components/dashboard/dashboard-layout/DashboardLayout.tsx) in the `QueryClientProvider` component
- submissions and filters are managed by the custom `useSubmissionsStore` hook, which creates a `zustand` store (see: src/components/dashboard/dashboard-page/DashboardPage.tsx)
  - This makes `DashboardPage.tsx` the "engine" for applying query filters


### Development Tips

Some things to think about when writing components:

- coordination with other components that may affect the same filter
- double check that the global clear filter works on the component
- make sure to handle cases when no data is returned (e.g. very specific filters, API error)
- think about whether the component needs to interact with the URL params
- ensure that any key interactions are included in analytics using the `trackUmamiEvent` function or the proper [data attributes in links or buttons](https://umami.is/docs/track-events).
- [accessibility (A11y) testing](https://developer.mozilla.org/en-US/docs/Web/Accessibility), e.g. in the interaction options offered and colour selection


### Testing Tips

Use `screen.debug()` in a Jest test to see the rendered DOM

To run a single test, make sure you are in the frontend directory and then run:

```shell
jest PATH_TO_TEST_FILE
```

You may need to make sure that Jest is in your global path. More instructions on using the Jest CLI can be found here: https://jestjs.io/docs/getting-started#running-from-command-line

can also use `--watch` or `--watchAll` when developing to only re-run relevant tests when needed
