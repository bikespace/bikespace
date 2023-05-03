import React from "react";
import { IssueType } from "../interfaces/Submission";
import BaseButton from "./BaseButton";

const Issue = (props: {comments: IssueType[], onCommentsChanged: (comments: IssueType[]) => void}) => {
  const comments = props.comments
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    let newComments: IssueType[];
    if (!comments.includes(issueType)) {
      newComments = [...comments, issueType]
    } else {
      newComments = [...comments.filter((comment) => comment !== issueType)];
    }
    props.onCommentsChanged(newComments);
  };

  return (
    <div id="submission-issue">
      <h2>What was the issue?</h2>
      <h3>Choose at least one</h3>
      <ul>
        <li>
          <BaseButton
            active={comments.includes(IssueType.NotProvided)}
            value="not_provided"
            onClick={handleClick}
          >
            Bicycle parking is&nbsp;<strong>not provided</strong>
          </BaseButton>
        </li>
        <li>
          <BaseButton
            active={comments.includes(IssueType.Full)}
            value="full"
            onClick={handleClick}
          >
            Bicycle parking is&nbsp;<strong>full</strong>
          </BaseButton>
        </li>
        <li>
          <BaseButton
            active={comments.includes(IssueType.Damaged)}
            value="damaged"
            onClick={handleClick}
          >
            Bicycle parking is&nbsp;<strong>damaged</strong>
          </BaseButton>
        </li>
        <li>
          <BaseButton
            active={comments.includes(IssueType.Abandoned)}
            value="abandoned"
            onClick={handleClick}
          >
            A bicycle is&nbsp;<strong>abandoned</strong>
          </BaseButton>
        </li>
        <li>
          <BaseButton
            active={comments.includes(IssueType.Other)}
            value="other"
            onClick={handleClick}
          >
            Something else
          </BaseButton>
        </li>
      </ul>
    </div>
  );
};
export default Issue;