import {SharedState, Component} from './components/main.js';
import {Map} from './components/map.js';
import {SummaryBox} from './components/sidebar/summary_box.js';
import {IssueChart} from './components/sidebar/issue_chart.js';
import {DayChart} from './components/sidebar/day_chart.js';
import {DurationTimeOfDayChart} from './components/sidebar/duration_tod_chart.js';
import {Submissions} from './components/sidebar/submissions.js';

$.ajax({
  url: 'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000',
  success: function (data) {
    const shared_state = new SharedState(data);
    new Component('body', 'sidebar', shared_state);
    new SummaryBox('#sidebar', 'summary-box', shared_state, {
      className: 'sidebar-panel',
    });
    new IssueChart('#sidebar', 'issue-chart', shared_state, {
      className: 'sidebar-panel',
    });
    new DayChart('#sidebar', 'day-chart', shared_state, {
      className: 'sidebar-panel',
    });
    new DurationTimeOfDayChart('#sidebar', 'duration-tod-chart', shared_state, {
      className: 'sidebar-panel',
    });
    new Submissions('#sidebar', 'submissions', shared_state, {
      className: 'sidebar-panel',
      isOverview: true,
    });
    new Map('body', 'map', shared_state);
  },
});
