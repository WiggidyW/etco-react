export type Strs = string[];

// SDE Types
export interface SDEType {
  typeId: number;
  typeStrIndex: number;
  categoryStrIndex: number;
  groupStrIndex: number;
  marketGroupStrIndexes: number[];
}
export type SDETypes = SDEType[];

// SDE Location Flags
export type LocationFlags = string[];

// BuybackSystems + SDESystems
export interface System {
  systemStrIndex: number;
  regionId: number;
  regionStrIndex: number;
}
export type Systems = { [systemId: number]: System };

// ShopLocations
export interface ShopLocation {
  locationName: string;
  isStructure: boolean;
  forbiddenStructure: boolean;
  taxRate: number;
}
export type ShopLocations = { [locationId: number]: ShopLocation };
