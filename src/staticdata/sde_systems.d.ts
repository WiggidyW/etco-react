import { Systems, RegionNames } from "./types";

export interface ContentSdeSystems {
  SDE_SYSTEMS: Systems;
  SDE_REGION_NAMES: RegionNames;
}

declare module "sde_systems.json" {
  const content: ContentSdeSystems;
  export default content;
}
