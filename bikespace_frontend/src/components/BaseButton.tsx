import React from "react";

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
      </button>
    );
  }
}

export default BaseButton;
