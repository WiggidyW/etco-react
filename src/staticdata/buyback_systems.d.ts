import { Systems, RegionNames } from "./types";

export interface ContentBuybackSystems {
  BUYBACK_SYSTEMS: Systems;
  BUYBACK_REGION_NAMES: RegionNames;
}

declare module "buyback_systems.json" {
  const content: ContentBuybackSystems;
  export default content;
}
