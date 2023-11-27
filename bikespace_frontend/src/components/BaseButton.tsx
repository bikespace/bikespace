import React from "react";
import { StaticImage } from "gatsby-plugin-image";

type BaseButtonProps = {
  type: string,
  children: React.ReactNode;
  value: string;
  active: boolean;
  name: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

class BaseButton extends React.Component<BaseButtonProps> {
  render(): React.ReactNode {
    return (
      <>
        {this.props.type === 'checkbox' &&
          <input
            type="checkbox"
            value={this.props.value}
            checked={this.props.active}
            id={`${this.props.name}_${this.props.value}`} />}
        {this.props.type === 'radio' &&
          <input
            type="radio"
            name={this.props.name}
            checked={this.props.active}
            id={`${this.props.name}_${this.props.value}`} />}
        <label htmlFor={`${this.props.name}_${this.props.value}`}>
          <button
            type="button"
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
        </label>
      </>
    );
  }
}

export default BaseButton;
