import { ShopLocations, RegionNames, SystemNames } from "./types";

export interface ContentShopLocations {
  SHOP_LOCATIONS: ShopLocations;
  SHOP_REGION_NAMES: RegionNames;
  SHOP_SYSTEM_NAMES: SystemNames;
}

declare module "shop_locations.json" {
  const content: ContentShopLocations;
  export default content;
}
