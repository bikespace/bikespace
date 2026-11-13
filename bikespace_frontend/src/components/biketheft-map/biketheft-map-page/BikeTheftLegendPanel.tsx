import {BikeTheftLegend} from '@/components/map-layers/bike-theft';
import {TheftRateLayerLegend} from '@/components/map-layers/TheftRate';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';

import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';

export function BikeTheftLegendPanel({
  showTheftRate = false,
}: {
  showTheftRate?: boolean;
}) {
  return (
    <SidebarDetailsDisclosure open>
      <summary>Legend</summary>
      <SidebarDetailsContent className={parkingStyles.legendContent}>
        <BikeTheftLegend />
        {showTheftRate ? <TheftRateLayerLegend /> : null}
      </SidebarDetailsContent>
    </SidebarDetailsDisclosure>
  );
}
