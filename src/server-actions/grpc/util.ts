import * as pb from "@/proto/etco";

export const NewEmptyPbBuybackAppraisal = (): pb.BuybackAppraisal => ({
  rejected: false,
  code: "",
  time: 0,
  items: [],
  version: "",
  characterId: 0,
  systemInfo: {
    systemId: 0,
    systemStrIndex: 0,
    regionId: 0,
    regionStrIndex: 0,
  },
  price: 0,
  tax: 0,
  taxRate: 0,
  fee: 0,
  feePerM3: 0,
});

export const NewEmptyPbStrs = (): string[] => ["undefined"];
