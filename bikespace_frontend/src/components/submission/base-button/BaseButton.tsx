import React from 'react';

import styles from './base-button.module.scss';

import checkIcon from '@/assets/icons/check.svg';

type BaseButtonProps = {
  type: 'checkbox' | 'radio';
  children: React.ReactNode;
  value: string;
  active: boolean;
  name: string;
  onClick: (e: React.FormEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export class BaseButton extends React.Component<BaseButtonProps> {
  render(): React.ReactNode {
    return (
      <div className={styles.inputContainer}>
        {this.props.type === 'checkbox' && (
          <input
            type="checkbox"
            data-value={this.props.value}
            onChange={this.props.onClick}
            value={this.props.value}
            checked={this.props.active}
            id={`${this.props.name}_${this.props.value}`}
            data-umami-event={`${this.props.name}_${this.props.value}`}
            disabled={this.props.isDisabled ?? false}
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
            disabled={this.props.isDisabled ?? false}
          />
        )}
        <label htmlFor={`${this.props.name}_${this.props.value}`}>
          <div className={styles.baseButton}>
            {this.props.children}
            <img className={styles.check} src={checkIcon.src} alt="checkmark" />
          </div>
        </label>
      </div>
    );
  }
}
