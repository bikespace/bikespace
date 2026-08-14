import styles from './animated-ellipses.module.scss';

export function AnimatedEllipses() {
  return (
    <span className={styles.animatedEllipses}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}
