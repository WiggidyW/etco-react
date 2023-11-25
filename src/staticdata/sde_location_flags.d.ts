import { LocationFlags } from "./types";

export interface ContentSdeLocationFlags {
  LOCATION_FLAGS: LocationFlags;
}

declare module "sde_location_flags.json" {
  const content: ContentSdeLocationFlags;
  export default content;
}
