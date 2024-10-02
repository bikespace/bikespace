import React from 'react';

import styles from './spinner.module.scss';

export function Spinner({
  customStyles = {},
}: {
  customStyles?: React.CSSProperties;
}) {
  return <span className={styles.spinner} style={customStyles}></span>;
}
