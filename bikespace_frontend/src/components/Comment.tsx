import React, { Component } from "react";
import { SubmissionComponentProps } from "../interfaces/Submission";

class Comment extends React.Component<SubmissionComponentProps> {
  render(): React.ReactNode {
    return <h1>Comment</h1>;
  }
}

export default Comment;
