import React from "react";

type SubmissionProgressBarProps = {
  step: number;
};

class SubmissionProgressBar extends React.Component<SubmissionProgressBarProps> {
  isActive(step: number): boolean {
    return this.props.step === step;
  }

  render(): React.ReactNode {
    return (
      <div id="submission-progress-bar">
        <div id="middle-line" />
        <div className={`step ${this.isActive(0) ? "active" : ""}`} />
        <div className={`step ${this.isActive(1) ? "active" : ""}`} />
        <div className={`step ${this.isActive(2) ? "active" : ""}`} />
        <div className={`step ${this.isActive(3) ? "active" : ""}`} />
        <div className={`step ${this.isActive(4) ? "active" : ""}`} />
      </div>
    );
  }
}

export default SubmissionProgressBar;
