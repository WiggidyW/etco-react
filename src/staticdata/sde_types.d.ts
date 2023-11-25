import { SDETypes, Strs } from "./types";

export interface ContentSdeTypes {
  SDE_TYPE_DATA: SDETypes;
  STRS: Strs;
}

declare module "sde_types.json" {
  const content: ContentSdeTypes;
  export default content;
}
