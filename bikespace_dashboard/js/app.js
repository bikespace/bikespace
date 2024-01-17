import {SharedState, Component} from './components/main.js';
import {Map} from './components/map.js';
import {SummaryBox} from './components/sidebar/summary_box.js';
import {IssueChart} from './components/sidebar/issue_chart.js';
import {DayChart} from './components/sidebar/day_chart.js';
import {DurationTimeOfDayChart} from './components/sidebar/duration_tod_chart.js';

$.ajax({
  url: 'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000',
  success: function (data, textStatus, jqXHR) {
    const shared_state = new SharedState(data);
    const sidebar = new Component('body', 'sidebar', shared_state);
    const summary_box = new SummaryBox('#sidebar', 'summary-box', shared_state);
    const issue_chart = new IssueChart('#sidebar', 'issue-chart', shared_state);
    const day_chart = new DayChart('#sidebar', 'day-chart', shared_state);
    const duration_tod_chart = new DurationTimeOfDayChart(
      '#sidebar',
      'duration-tod-chart',
      shared_state
    );
    const map = new Map('body', 'map', shared_state);
  },
});
