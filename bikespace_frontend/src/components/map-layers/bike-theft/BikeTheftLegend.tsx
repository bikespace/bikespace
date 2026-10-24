import styles from './bike-theft.module.scss';

export function BikeTheftLegend() {
  return (
    <div className={styles.legendList}>
      <div className={styles.legendRow}>
        <span
          className={styles.legendSwatch}
          style={{backgroundColor: '#e53935', borderRadius: '50%'}}
          role="img"
          aria-label="red circle"
        />
        <span className={styles.legendLabel}>Stolen</span>
      </div>
      <div className={styles.legendRow}>
        <span
          className={styles.legendSwatch}
          style={{backgroundColor: '#2e7d32', borderRadius: '50%'}}
          role="img"
          aria-label="green circle"
        />
        <span className={styles.legendLabel}>Recovered</span>
      </div>
      <div className={styles.legendRow}>
        <span
          className={styles.legendSwatch}
          style={{backgroundColor: '#2E6FA0', borderRadius: '50%'}}
          role="img"
          aria-label="blue circle"
        />
        <span className={styles.legendLabel}>Stolen &amp; Recovered</span>
      </div>
    </div>
  );
}
