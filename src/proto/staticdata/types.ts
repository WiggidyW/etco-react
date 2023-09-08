// SDE Types
export interface SDEType {
  typeId: number;
  name: string;
  groupIndex: number;
  categoryIndex: number;
  marketGroupIndexes: number[];
}
export type SDETypes = SDEType[];
export type GroupNames = string[];
export type CategoryNames = string[];
export type MarketGroupNames = string[];

// BuybackSystems
export interface BuybackSystem {
  systemName: string;
  regionId: number;
}
export type BuybackSystems = { [systemId: number]: BuybackSystem };

// ShopLocations
export interface ShopLocation {
  isStructure: boolean;
  forbiddenStructure: boolean;
  locationName: string; // "" if forbiddenStructure
  systemId: number;
  regionId: number;
}
export type ShopLocations = { [locationId: number]: ShopLocation };
export type SystemNames = { [systemId: number]: string };

// BuybackSystems + ShopLocations
export type RegionNames = { [regionId: number]: string };
