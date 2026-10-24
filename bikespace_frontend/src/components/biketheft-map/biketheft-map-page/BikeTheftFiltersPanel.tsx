import type {ComponentProps} from 'react';
import {BikeTheftFilters} from './BikeTheftFilters';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';
export function BikeTheftFiltersPanel(
  props: ComponentProps<typeof BikeTheftFilters>
) {
  return (
    <SidebarDetailsDisclosure open>
      <summary>Filters</summary>
      <SidebarDetailsContent>
        <BikeTheftFilters {...props} />
      </SidebarDetailsContent>
    </SidebarDetailsDisclosure>
  );
}
