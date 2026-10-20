import type {RefObject} from 'react';
import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';
import {BikeTheftReportDetails} from '@/components/map-layers/bike-theft';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';
import styles from './bike-theft-report-card.module.scss';

interface BikeTheftReportCardProps {
  selectedReports: StolenBikeReport[];
  cardRef: RefObject<HTMLDivElement>;
  onClearSelection: () => void;
}
export function BikeTheftReportCard({
  selectedReports,
  cardRef,
  onClearSelection,
}: BikeTheftReportCardProps) {
  return (
    <div className={parkingStyles.ContentCard} ref={cardRef}>
      <div className={parkingStyles.ContentHeading}>
        <h2 className={parkingStyles.cardHeading}>Bike Theft History</h2>
      </div>
      {/* --- Render card--- */}
      {selectedReports.length > 0 ? (
        <>
          <p>
            {selectedReports.length} report
            {selectedReports.length === 1 ? '' : 's'} selected
          </p>
          <ul
            className={styles.selectedReportsList}
            aria-label="Selected reports"
          >
            {selectedReports.map(report => (
              <li key={report.id}>
                <BikeTheftReportDetails report={report} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={parkingStyles.cardBody}>
          Click a pin on the map to view report details.
        </p>
      )}

      {selectedReports.length > 0 ? (
        <SidebarButton onClick={onClearSelection}>
          Clear Selection
        </SidebarButton>
      ) : null}
    </div>
  );
}
