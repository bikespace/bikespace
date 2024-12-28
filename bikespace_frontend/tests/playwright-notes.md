You can run several commands:

```bash
npx playwright test
# Runs the end-to-end tests.

npx playwright test --ui
# Starts the interactive UI mode.

npx playwright test --project=chromium
# Runs the tests only on Desktop Chrome.

npx playwright test example
# Runs the tests in a specific file.

npx playwright test --debug
# Runs the tests in debug mode.

npx playwright codegen
# Auto generate tests with Codegen.
```

```bash
npx playwright codegen http://localhost:8080 --timezone="America/Toronto" --geolocation="43.76,-79.43" --viewport-size=800,600
```

## Notes

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
