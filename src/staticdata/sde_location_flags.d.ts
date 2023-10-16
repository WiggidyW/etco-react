export interface ContentSdeLocationFlags {
  LOCATION_FLAGS: string[];
}

declare module "sde_location_flags.json" {
  const content: ContentSdeLocationFlags;
  export default content;
}
