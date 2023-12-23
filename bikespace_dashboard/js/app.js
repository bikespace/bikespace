import { SharedState, Component } from './components/main.js';
import { Map } from './components/map.js'
import { SummaryBox } from './components/sidebar.js';
import { IssueChart } from './components/sidebar.js';


$.ajax({
  url: 'https://api-dev.bikespace.ca/api/v2/submissions?limit=5000',
  success: function (data, textStatus, jqXHR) {
      let shared_state = new SharedState(data);
      let sidebar = new Component("body", "sidebar", shared_state);
      let summary_box = new SummaryBox("#sidebar", "summary-box", shared_state);
      let issue_chart = new IssueChart("#sidebar", "issue-chart", shared_state);
      let map = new Map("body", "map", shared_state);
  }
});