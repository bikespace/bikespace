import React, { Component } from "react";
import Submission, {
  SubmissionComponentProps,
  IssueType,
} from "../interfaces/Submission";
import "../styles/issue.scss";

class Issue extends Component<SubmissionComponentProps> {
  handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    let issueType: IssueType;
    switch (e.currentTarget.dataset.type) {
      case "not_provided":
        issueType = IssueType.NotProvided;
        break;
      case "full":
        issueType = IssueType.Full;
        break;
      case "damaged":
        issueType = IssueType.Damaged;
        break;
      case "abandoned":
        issueType = IssueType.Abandoned;
        break;
      default:
        issueType = IssueType.Other;
        break;
    }

    let newSubmission: Submission;
    if (!this.props.submission.comments.includes(issueType)) {
      newSubmission = {
        ...this.props.submission,
        comments: [...this.props.submission.comments, issueType],
      };
    } else {
      newSubmission = {
        ...this.props.submission,
        comments: [
          ...this.props.submission.comments.filter(
            (comment) => comment !== issueType
          ),
        ],
      };
    }
    this.props.onSubmissionChanged(newSubmission);
  };

  render(): React.ReactNode {
    return (
      <>
        <h2>What was the issue?</h2>
        <h3>Choose at least one</h3>
        <ul>
          <li
            className="secondary-pill-btn"
            onClick={this.handleClick}
            data-type="not_provided"
          >
            Bicycle parking is &nbsp;
            <strong> not provided</strong>
          </li>
          <li
            className="secondary-pill-btn"
            onClick={this.handleClick}
            data-type="full"
          >
            Bicycle parking is &nbsp;
            <strong>full</strong>
          </li>
          <li
            className="secondary-pill-btn"
            onClick={this.handleClick}
            data-type="damaged"
          >
            Bicycle parking is &nbsp;
            <strong>damaged</strong>
          </li>
          <li
            className="secondary-pill-btn"
            onClick={this.handleClick}
            data-type="abandoned"
          >
            A bicycle is &nbsp;
            <strong>abandoned</strong>
          </li>
          <li
            className="secondary-pill-btn"
            onClick={this.handleClick}
            data-type="other"
          >
            Something else
          </li>
        </ul>
      </>
    );
  }
}

export default Issue;
