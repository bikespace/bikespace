import React from 'react';
import styles from './spinner.module.scss';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type SpinnerProps = {
  show?: boolean;
  overlay?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Spinner({ show=true, overlay = false, label = 'Loading...', className, style
}: SpinnerProps) {
  if (!show) return null;
  if (overlay) {
    return (
      <div className={cx(styles.loadingOverlay, className)} aria-hidden="true" style={style}>
        <div className={styles.spinner} role="status" aria-label={label} />
      </div>
    )
  }
  return <div className={cx(styles.spinner, className)} role="status" aria-label={label} style={style} />;
}
