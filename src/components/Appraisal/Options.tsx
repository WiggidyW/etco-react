import { BUYBACK_SYSTEMS } from "@/staticdata/buyback_systems";
import { SHOP_LOCATIONS } from "@/staticdata/shop_locations";

export const getSystems = (): { label: string; value: string }[] =>
  Object.entries(BUYBACK_SYSTEMS).map(([systemId, { systemName }]) => ({
    label: systemName,
    value: systemId,
  }));

export const getLocations = (): { label: string; value: string }[] =>
  Object.entries(SHOP_LOCATIONS).map(([locationId, { locationName }]) => ({
    label: locationName,
    value: locationId,
  }));
