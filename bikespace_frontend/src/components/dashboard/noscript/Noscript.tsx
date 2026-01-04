import React from 'react';

export function Noscript() {
  return (
    <noscript>
      <h2>Please enable JavaScript to use this site</h2>
      <p>
        This dashboard needs to have JavaScript enabled to render dynamic
        content. If you are not able to enable JavaScript on this device, some
        other options for accessing the BikeSpace data include:
      </p>
      <ul>
        <li>
          Archived copies on our GitHub page:
          <a href="https://github.com/bikespace/bikespace-v2/tree/main/datasets">
            bikespace-v2/datasets/
          </a>
          {
            '(may not be 100% up-to-date; select "raw" to see the unformatted data).'
          }
        </li>
        <li>
          Via command line, e.g.:
          <pre>
            {
              ' $ curl "https://api-dev.bikespace.ca/api/v2/submissions?limit=5000" -o "bikespace_reports.json"'
            }
          </pre>
          See our GitHub page for
          <a href="https://github.com/bikespace/bikespace-v2/blob/main/bikespace_api/bikespace_api/static/bikespace-open-api.yaml">
            additional information about API parameters
          </a>
        </li>
      </ul>
    </noscript>
  );
}
