import { StoreKind } from "@/server-actions/grpc/grpc";
import {
  resultBuybackContractQueue,
  resultPurchaseQueue,
  resultShopContractQueue,
  resultUserData,
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
import { ErrorThrower } from "../ErrorThrower";

export interface ContractQueueLoaderProps {
  kind: StoreKind;
  token: string;
}
export const ContractQueueLoader = async ({
  kind,
  token,
}: ContractQueueLoaderProps): Promise<ReactElement> => {
  const queueResult =
    kind === "buyback"
      ? await resultBuybackContractQueue(token)
      : await resultShopContractQueue(token);

  if (queueResult.ok) {
    const { queue, locationNamingMaps } = queueResult.value;

    queue.sort((a, b) => b.contract.issued - a.contract.issued);

    return (
      <ContractQueueViewer
        kind={kind}
        locationNamingMaps={locationNamingMaps}
        queue={newGroupedContractQueue(kind, queue)}
      />
    );
  } else {
    return <ErrorThrower error={queueResult.error} />; // throw error on client
  }
};

export interface PurchaseQueueLoaderProps {
  token: string;
}
export const PurchaseQueueLoader = async ({
  token,
}: PurchaseQueueLoaderProps): Promise<ReactElement> => {
  const queueResult = await resultPurchaseQueue(token);
  if (queueResult.ok) {
    return <PurchaseQueueViewer queue={queueResult.value} />;
  } else {
    return <ErrorThrower error={queueResult.error} />; // throw error on client
  }
};

export interface UserQueueLoaderProps {
  token: string;
}
export const UserQueueLoader = async ({
  token,
}: UserQueueLoaderProps): Promise<ReactElement> => {
  const userDataResult = await resultUserData(token);
  if (userDataResult.ok) {
    const {
      buybackHistory: unfltBuybackHistory,
      shopHistory: unfltShopHistory,
      madePurchase,
      cancelledPurchase,
    } = userDataResult.value;

    const buybackHistory = newFlattenedUserQueue(
      "buyback",
      unfltBuybackHistory
    );
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
  } else {
    return <ErrorThrower error={userDataResult.error} />; // throw error on client
  }
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
