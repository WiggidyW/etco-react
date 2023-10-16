import { SDETypes, GroupNames, CategoryNames, MarketGroupNames } from "./types";

export interface ContentSdeTypes {
  SDE_TYPE_DATA: SDETypes;
  GROUP_NAMES: GroupNames;
  CATEGORY_NAMES: CategoryNames;
  MARKET_GROUP_NAMES: MarketGroupNames;
}

declare module "sde_types.json" {
  const content: ContentSdeTypes;
  export default content;
}
