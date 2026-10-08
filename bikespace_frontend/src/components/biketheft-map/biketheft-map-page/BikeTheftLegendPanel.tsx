import {BikeTheftLegend} from '@/components/map-layers/bike-theft';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';
export function BikeTheftLegendPanel() {
  return (
    <SidebarDetailsDisclosure open>
      <summary>Legend</summary>
      <SidebarDetailsContent>
        <BikeTheftLegend />
      </SidebarDetailsContent>
    </SidebarDetailsDisclosure>
  );
}
