import { Systems, Strs } from "./types";

export interface ContentSdeSystems {
  SDE_SYSTEMS: Systems;
  STRS: Strs;
}

declare module "sde_systems.json" {
  const content: ContentSdeSystems;
  export default content;
}
