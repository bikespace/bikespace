import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

type BaseButtonProps = {
  type: string;
  children: React.ReactNode;
  value: string;
  active: boolean;
  name: string;
  onClick: (e: React.FormEvent<HTMLInputElement>) => void;
};

class BaseButton extends React.Component<BaseButtonProps> {
  render(): React.ReactNode {
    return (
      <div className="input-container">
        {this.props.type === 'checkbox' && (
          <input
            type="checkbox"
            data-value={this.props.value}
            onChange={this.props.onClick}
            value={this.props.value}
            checked={this.props.active}
            id={`${this.props.name}_${this.props.value}`}
          />
        )}
        {this.props.type === 'radio' && (
          <input
            type="radio"
            data-value={this.props.value}
            onChange={this.props.onClick}
            name={this.props.name}
            checked={this.props.active}
            id={`${this.props.name}_${this.props.value}`}
          />
        )}
        <label htmlFor={`${this.props.name}_${this.props.value}`}>
          <div className="base-button">
            {this.props.children}
            <StaticImage
              className="check"
              src="../images/check.svg"
              alt="checkmark"
            />
          </div>
        </label>
      </div>
    );
  }
}

export default BaseButton;
