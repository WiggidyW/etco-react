import buyback_systems_json from "@/staticdata/buyback_systems.json";
import shop_locations_json from "@/staticdata/shop_locations.json";
import { ContentBuybackSystems } from "@/staticdata/buyback_systems";
import { ContentShopLocations } from "@/staticdata/shop_locations";
const { BUYBACK_SYSTEMS }: ContentBuybackSystems = buyback_systems_json;
const { SHOP_LOCATIONS }: ContentShopLocations = shop_locations_json;

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
