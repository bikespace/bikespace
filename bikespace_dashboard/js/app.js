import {SharedState, Component} from './components/main.js';
import {Map} from './components/map.js';
import {SummaryBox} from './components/sidebar/summary_box.js';
import {IssueChart} from './components/sidebar/issue_chart.js';
import {DayChart} from './components/sidebar/day_chart.js';
import {DurationTimeOfDayChart} from './components/sidebar/duration_tod_chart.js';

// Load data from BikeSpace API
$.ajax({
  url: 'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000',
  success: function (data) {
    const shared_state = new SharedState(data);
    new Component('body', 'sidebar', shared_state);
    new SummaryBox('#sidebar', 'summary-box', shared_state);
    new IssueChart('#sidebar', 'issue-chart', shared_state);
    new DayChart('#sidebar', 'day-chart', shared_state);
    new DurationTimeOfDayChart('#sidebar', 'duration-tod-chart', shared_state);
    new Map('body', 'map', shared_state);
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