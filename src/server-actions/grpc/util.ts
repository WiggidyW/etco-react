import * as pb from "@/proto/etco";

export const TypeNamesAll: pb.IncludeTypeNaming = {
  includeName: true,
  includeMarketGroups: true,
  includeCategory: true,
  includeGroup: true,
};
export const ItemNamesOnly: pb.IncludeTypeNaming = {
  includeName: true,
  includeMarketGroups: false,
  includeCategory: false,
  includeGroup: false,
};
export const LocationNamesAll: pb.IncludeLocationNaming = {
  includeLocationName: true,
  includeSystemName: true,
  includeRegionName: true,
};
export const EmptyPbBuybackAppraisal: pb.BuybackAppraisal = {
  items: [],
  code: "",
  price: 0,
  time: 0,
  version: "",
  systemId: -1,
};
