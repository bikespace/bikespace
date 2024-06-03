import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

import * as styles from './base-button.module.scss';

type BaseButtonProps = {
  type: string;
  children: React.ReactNode;
  value: string;
  active: boolean;
  name: string;
  onClick: (e: React.FormEvent<HTMLInputElement>) => void;
};

export class BaseButton extends React.Component<BaseButtonProps> {
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
            data-umami-event={`${this.props.name}_${this.props.value}`}
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
            data-umami-event={`${this.props.name}_${this.props.value}`}
          />
        )}
        <label htmlFor={`${this.props.name}_${this.props.value}`}>
          <div className={styles.baseButton}>
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
