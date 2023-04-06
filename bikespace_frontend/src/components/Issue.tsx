import React, { Component } from "react";
import Submission, {
  SubmissionComponentProps,
  IssueType,
} from "../interfaces/Submission";
import BaseButton from "./BaseButton";

class Issue extends Component<SubmissionComponentProps> {
  comments = () => this.props.submission.comments;
  handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let issueType: IssueType;
    switch (e.currentTarget.dataset.value) {
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
    if (!this.comments().includes(issueType)) {
      newSubmission = {
        ...this.props.submission,
        comments: [...this.comments(), issueType],
      };
    } else {
      newSubmission = {
        ...this.props.submission,
        comments: [
          ...this.comments().filter((comment) => comment !== issueType),
        ],
      };
    }
    this.props.onSubmissionChanged(newSubmission);
  };

  render(): React.ReactNode {
    return (
      <div id="submission-issue">
        <h2>What was the issue?</h2>
        <h3>Choose at least one</h3>
        <ul>
          <li>
            <BaseButton
              active={this.comments().includes(IssueType.NotProvided)}
              value="not_provided"
              onClick={this.handleClick}
            >
              Bicycle parking is&nbsp;<strong>not provided</strong>
            </BaseButton>
          </li>
          <li>
            <BaseButton
              active={this.comments().includes(IssueType.Full)}
              value="full"
              onClick={this.handleClick}
            >
              Bicycle parking is&nbsp;<strong>full</strong>
            </BaseButton>
          </li>
          <li>
            <BaseButton
              active={this.comments().includes(IssueType.Damaged)}
              value="damaged"
              onClick={this.handleClick}
            >
              Bicycle parking is&nbsp;<strong>damaged</strong>
            </BaseButton>
          </li>
          <li>
            <BaseButton
              active={this.comments().includes(IssueType.Abandoned)}
              value="abandoned"
              onClick={this.handleClick}
            >
              A bicycle is&nbsp;<strong>abandoned</strong>
            </BaseButton>
          </li>
          <li>
            <BaseButton
              active={this.comments().includes(IssueType.Other)}
              value="other"
              onClick={this.handleClick}
            >
              Something else
            </BaseButton>
          </li>
        </ul>
      </div>
    );
  }
}

export default Issue;
