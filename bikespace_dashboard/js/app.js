import {PanelNav} from './components/sidebar/panel_nav.js';
import {SharedState} from './components/main.js';
import {Map} from './components/map.js';
import {SummaryBox} from './components/sidebar/data-panel/summary_box.js';
import {IssueChart} from './components/sidebar/data-panel/issue_chart.js';
import {DayChart} from './components/sidebar/data-panel/day_chart.js';
import {DurationTimeOfDayChart} from './components/sidebar/data-panel/duration_tod_chart.js';
import {Submissions} from './components/sidebar/feed/submissions.js';
import '../libraries/leaflet-locatecontrol/L.Control.Locate.min.js';

const USE_DEV = false;
const DEV_BASE_URL = ''; // empty string = use current location as /api is proxied with the dev server to avoid CORS mess
const PROD_BASE_URL = 'https://api-dev.bikespace.ca';
import {DateFilterControl} from './components/sidebar/filter-panel/date_filter.js';
import {ParkingDurationFilterControl} from './components/sidebar/filter-panel/parking_duration_filter.js';

// Header logic
const getHeader = () => {
  const header = document.querySelector('body>header');
  if (!header) throw new Error('Unexpected: Found no header in the page');
  return header;
};

const getNavToggle = () => {
  const toggle = getHeader().querySelector('&>#nav-toggle');
  if (!toggle) throw new Error('Unexpected: Found no nav toggle in the page');
  return toggle;
};

const getNavMenu = () => {
  const navMenu = getHeader().querySelector('&>nav');
  if (!navMenu) throw new Error('Unexpected: Found no nav toggle in the page');
  return navMenu;
};

const getNavBackdrop = () => {
  const navBackdrop = getHeader().querySelector('&>#nav-backdrop');
  if (!navBackdrop)
    throw new Error('Unexpected: Found no nav backdrop in the page');
  return navBackdrop;
};

const initCollapsibleMenu = () => {
  const navToggle = getNavToggle();
  navToggle.addEventListener('click', () => {
    getNavMenu().classList.toggle('open');
  });
  const navBackdrop = getNavBackdrop();
  navBackdrop.addEventListener('click', () => {
    getNavMenu().classList.remove('open');
  });
};

const initHeader = () => {
  initCollapsibleMenu();
};

window.addEventListener('DOMContentLoaded', () => {
  initHeader();
});

// Load data from BikeSpace API
$.ajax({
  url: `${
    USE_DEV ? DEV_BASE_URL : PROD_BASE_URL
  }/api/v2/submissions?limit=5000`,
  success: function (data) {
    // add interactive content
    const shared_state = new SharedState(data);
    // add sidebar panel nav
    new PanelNav('body', 'panels', shared_state);
    // add interactive content
    new SummaryBox('#panels-section-data', 'summary-box', shared_state, {
      className: 'sidebar-panel',
    });
    new IssueChart('#panels-section-data', 'issue-chart', shared_state, {
      className: 'sidebar-panel',
    });
    new DayChart('#panels-section-data', 'day-chart', shared_state, {
      className: 'sidebar-panel',
    });
    new DurationTimeOfDayChart(
      '#panels-section-data',
      'duration-tod-chart',
      shared_state,
      {
        className: 'sidebar-panel',
      }
    );
    new Submissions('#panels-section-feed', 'submissions', shared_state, {
      className: 'sidebar-panel',
    });
    // add filter controls
    new SummaryBox(
      '#panels-section-filters',
      'summary-box-filters',
      shared_state,
      {className: 'sidebar-panel'}
    );
    new DateFilterControl(
      '#panels-section-filters',
      'date-filter',
      shared_state,
      {className: 'sidebar-panel'}
    );
    new ParkingDurationFilterControl(
      '#panels-section-filters',
      'parking-duration-filter',
      shared_state,
      {className: 'sidebar-panel'}
    );
    // add map
    new Map('body', 'issue-map', shared_state);
  },
});

// Enhance feedback mailto link
const feedback_to = 'bikespaceto@gmail.com';
const feedback_subject = 'BikeSpace Dashboard Feedback';
const feedback_body = `----------
Please describe your feedback about dashboard.bikespace.ca below. We welcome both positive feedback (e.g. I found x feature useful) and constructive feedback (e.g. y is broken, I wish the dashboard did z).

Especially for constructive feedback, you can help us by letting us know:
- Your browser and platform (e.g. Safari, iPhone)
- If it's a bug, what steps led to the problem
- If it's something you wish the dashboard was able to do, what goal would that feature help you accomplish? (e.g. "I wanted to see only issues along street x", or "I wanted to better understand issues of y type")

Thank you for taking the time to help us make the dashboard better!
----------

Hi BikeSpace team,

`;
const new_href = [
  `mailto:${feedback_to}`,
  `?subject=${encodeURIComponent(feedback_subject)}`,
  `&body=${encodeURIComponent(feedback_body)}`,
].join('');
document.getElementById('mailto-feedback').href = new_href;
