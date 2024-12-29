# Playwright Usage Notes and Tips

## Common Commands

Commands to run or help develop Playwright tests:

```bash
# Runs the end-to-end tests.
npx playwright test

# Starts the interactive UI mode.
npx playwright test --ui

# Runs the tests only on Desktop Chrome.
npx playwright test --project=chromium

# Runs the tests in a specific file.
npx playwright test example

# Runs the tests in debug mode.
npx playwright test --debug

# Auto generate tests with Codegen.
npx playwright codegen
```

```bash
# Codegen with config
npx playwright codegen http://localhost:8080 --timezone="America/Toronto" --geolocation="43.76,-79.43" --viewport-size=800,600
```

## Notes

### Server pre-requisites

`npx playwright test` will start up the frontend server and the api server if they are not already running (using the configuration in `playwright.config.ts` under `webServer`). The config uses the make commands to run the servers, for consistency. For the API server, postgres will have to be set up (see instructions in the `./bikespace_api` README).

`npx playwright codegen` does not appear to auto-start the development servers, so you will have to run e.g. `make dev-frontend` from the project root first and then separately run `npx playwright codegen` from `./bikespace_frontend`.

### Prevent interaction before hydration

If state is not updating after interaction, playwright may be interacting with the page before it is hydrated. The suggested solution is to make inputs disabled until hydrated. E.g. you can add:

```tsx
export default function MyComponent() {
  const [hydrated, setHydrated] = useState<boolean>(false);
  useEffect(() => setHydrated(true), []);

  ...

  return <button disabled={!hydrated}>Press Me!</button>
}

```

### Quirks with toMatchAriaSnapshot

`.toMatchAriaSnapshot` doesn't like regexes with colons in them (this is a known limitation of the YAML format). Use the HTML escape code instead, e.g. instead of `/Example: some text/`, use `/Example&#58; some text/`. Other special regex characters also need double escaping, though the generator should do this for you.

### Testing Map Libraries

When testing map libraries (e.g. Leaflet, maplibre), a couple tips may help:

[Test config](https://playwright.dev/docs/test-use-options): with `test.use()`, you can set `geolocation`, allow geolocation using `permissions: ['geolocation']`, and define the viewport size using `viewport` to ensure consistent locations for UI elements.

You may need to use an implementation-specific selector to get the interactive element (e.g. `page.locator('div.leaflet-container')`) and may also need to wait for the map to load using e.g. `await page.waitForSelector('div.leaflet-container')` before testing the interaction. Running `npx playwright test --ui` can help you see if the map element has loaded before interaction.

To click on the map canvas, you can call [`.click()`](https://playwright.dev/docs/api/class-locator#locator-click) on the locator or [`page.mouse.click()`](https://playwright.dev/docs/api/class-mouse#mouse-click). Each option has a different syntax for specifying the x and y coordinates. To get x and y coordinates (e.g. while running codegen) you can [follow the instructions on this blog](https://michaelwornow.net/2024/01/02/display-x-y-coords-chrome-debugger). On Firefox, you can use the [measure tool](https://firefox-source-docs.mozilla.org/devtools-user/measure_a_portion_of_the_page/index.html).