import { Systems, Strs } from "./types";

export interface ContentBuybackSystems {
  BUYBACK_SYSTEMS: Systems;
  STRS: Strs;
}

declare module "buyback_systems.json" {
  const content: ContentBuybackSystems;
  export default content;
}
