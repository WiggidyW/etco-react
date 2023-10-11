import { StoreKind } from "@/server-actions/grpc/grpc";
import {
  ContractStatus as PBContractStatus,
  Contract as PBContract,
} from "@/proto/etco";
import {
  UserQueueEntry,
  buybackContractQueue,
  purchaseQueue,
  shopContractQueue,
  userData,
} from "@/server-actions/grpc/queue";
import { ReactElement } from "react";
import {
  AppraisalStatusTab,
  FlattenedUserQueueEntry,
  newFlattenedUserQueue,
  newGroupedContractQueue,
} from "./status";
import {
  ContractQueueViewer,
  PurchaseQueueViewer,
  UserQueueViewer,
} from "./Viewer";

export interface ContractQueueLoaderProps {
  kind: StoreKind;
  token: string;
}
export const ContractQueueLoader = async ({
  kind,
  token,
}: ContractQueueLoaderProps): Promise<ReactElement> => {
  const { queue, locationNamingMaps } =
    kind === "buyback"
      ? await buybackContractQueue(token)
      : await shopContractQueue(token);
  queue.sort((a, b) => b.contract.expires - a.contract.expires);
  return (
    <ContractQueueViewer
      kind={kind}
      locationNamingMaps={locationNamingMaps}
      queue={newGroupedContractQueue(kind, queue)}
    />
  );
};

export interface PurchaseQueueLoaderProps {
  token: string;
}
export const PurchaseQueueLoader = async ({
  token,
}: PurchaseQueueLoaderProps): Promise<ReactElement> => {
  const queue = await purchaseQueue(token);
  return <PurchaseQueueViewer queue={queue} />;
};

export interface UserQueueLoaderProps {
  token: string;
}
export const UserQueueLoader = async ({
  token,
}: UserQueueLoaderProps): Promise<ReactElement> => {
  const {
    buybackHistory: unfltBuybackHistory,
    shopHistory: unfltShopHistory,
    madePurchase,
    cancelledPurchase,
  } = await userData(token);
  const buybackHistory = newFlattenedUserQueue("buyback", unfltBuybackHistory);
  const shopHistory = newFlattenedUserQueue("shop", unfltShopHistory);
  buybackHistory.sort(historyCompare);
  shopHistory.sort(historyCompare);
  return (
    <UserQueueViewer
      buybackHistory={buybackHistory}
      shopHistory={shopHistory}
      madePurchase={madePurchase}
      cancelledPurchase={cancelledPurchase}
    />
  );
};

type UserCompareValue = {
  segment: 1 | 2 | 3;
  weight: number; // smaller = comes first
  cmpExpires: boolean;
  cmpCode: true;
};

const historyCompare = (
  a: FlattenedUserQueueEntry,
  b: FlattenedUserQueueEntry
): number => {
  const aCmpVal = getHistoryCompareValue(a.status);
  const bCmpVal = getHistoryCompareValue(b.status);

  const segDiff = aCmpVal.segment - bCmpVal.segment;
  if (segDiff !== 0) return segDiff;

  const weightDiff = aCmpVal.weight - bCmpVal.weight;
  if (weightDiff !== 0) return weightDiff;

  if (aCmpVal.cmpExpires && bCmpVal.cmpExpires) {
    const expiresDiff = a.expires! - b.expires!;
    if (expiresDiff !== 0) return expiresDiff;
  }

  if (aCmpVal.cmpCode && bCmpVal.cmpCode) {
    return a.code.localeCompare(b.code);
  } else {
    return 0;
  }
};

const getHistoryCompareValue = (
  status: AppraisalStatusTab
): UserCompareValue => {
  switch (status) {
    case "Undefined": // last segment
      return { segment: 3, weight: 0, cmpExpires: false, cmpCode: true };
    case "Outstanding": // first segment first
      return { segment: 1, weight: 0, cmpExpires: true, cmpCode: true };
    case "In Purchase Queue": // first segment second
      return { segment: 1, weight: 1, cmpExpires: false, cmpCode: true };
    default: // middle segment
      return { segment: 2, weight: 0, cmpExpires: true, cmpCode: true };
  }
};
