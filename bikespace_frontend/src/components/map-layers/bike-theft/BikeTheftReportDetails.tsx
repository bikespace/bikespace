import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';
import styles from './bike-theft.module.scss';

// --- Status badge helper ---
function StatusBadge({status}: {status: StolenBikeReport['status']}) {
  const isRecovered = status === 'recovered';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: isRecovered ? '#e8f5e9' : '#ffebee',
        color: isRecovered ? '#2e7d32' : '#c62828',
        border: `1px solid ${isRecovered ? '#a5d6a7' : '#ef9a9a'}`,
      }}
    >
      {isRecovered ? '✓ Recovered' : '✗ Stolen'}
    </span>
  );
}

export function BikeTheftReportDetails({report}: {report: StolenBikeReport}) {
  return (
    <div className={styles.selectedFeatureDetails}>
      <div style={{marginBottom: 8}}>
        <StatusBadge status={report.status} />
      </div>
      <div>
        <strong>Date:</strong> {report.date}
      </div>
      <div>
        <strong>Location:</strong> {report.location}
      </div>
      <div>
        <strong>Bike Type:</strong> {report.bikeType}
      </div>
      <div>
        <strong>Color:</strong> {report.color}
      </div>
      <div>
        <strong>Description:</strong> {report.description}
      </div>
    </div>
  );
}
