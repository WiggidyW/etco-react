import { ShopLocations } from "./types";

export interface ContentShopLocations {
  SHOP_LOCATIONS: ShopLocations;
}

declare module "shop_locations.json" {
  const content: ContentShopLocations;
  export default content;
}
