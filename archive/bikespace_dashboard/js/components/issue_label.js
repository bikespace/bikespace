import {issue_attributes} from './api_tools.js';

const makeIssueLabelById = (id, {long = false} = {}) => {
  const issue = issue_attributes[id];
  if (!issue) throw new Error('Issue id is unexpected.');
  return makeIssueLabel(issue, {long});
};

const makeIssueLabel = (issue, {long = false} = {}) =>
  `<div class="issue issue-${issue.id.replace('_', '-')}" 
style="border-color:${issue.color};
background-color:${issue.color_light};"
>${long ? issue.label_long : issue.label_short}</div>
  `;

export {makeIssueLabel, makeIssueLabelById};
