import React from "react";
import { StaticImage } from "gatsby-plugin-image";

type BaseButtonProps = {
  children: React.ReactNode;
  value: string;
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

class BaseButton extends React.Component<BaseButtonProps> {
  render(): React.ReactNode {
    return (
      <button
        className={`base-button ${this.props.active ? "active" : ""}`}
        onClick={this.props.onClick}
        data-value={this.props.value}
      >
        {this.props.children}
        <StaticImage
          className="check"
          src="../images/check.svg"
          alt="checkmark"
        />
      </button>
    );
  }
}

export default BaseButton;
