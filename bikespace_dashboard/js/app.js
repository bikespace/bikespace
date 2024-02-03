import {PanelNav} from './components/sidebar/panel_nav.js';
import {SharedState, Component} from './components/main.js';
import {Map} from './components/map.js';
import {SummaryBox} from './components/sidebar/data-panel/summary_box.js';
import {IssueChart} from './components/sidebar/data-panel/issue_chart.js';
import {DayChart} from './components/sidebar/data-panel/day_chart.js';
import {DurationTimeOfDayChart} from './components/sidebar/data-panel/duration_tod_chart.js';
import {Submissions} from './components/sidebar/feed/submissions.js';

$.ajax({
  url: 'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000',
  success: function (data) {
    // add sidebar panel nav
    new PanelNav('body header', 'panels');
    // add interactive content
    const shared_state = new SharedState(data)
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
    new Map('body', 'issue-map', shared_state);
    new Submissions('#panels-section-feed', 'submissions', shared_state, {
      className: 'sidebar-panel',
    });
  },
});
