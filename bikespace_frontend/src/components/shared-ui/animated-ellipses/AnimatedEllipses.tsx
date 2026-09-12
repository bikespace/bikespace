import styles from './animated-ellipses.module.scss';

export function AnimatedEllipses() {
  return (
    <span
      className={styles.animatedEllipses}
      role="status"
      aria-label="Loading"
    >
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}
