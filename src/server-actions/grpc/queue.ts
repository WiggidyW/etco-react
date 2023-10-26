"use server";

import { StoreKind, dispatchAuthenticated, throwInvalid } from "./grpc";
import {
  ContractStatus,
  UserAppraisalStatus,
  newContractStatus,
} from "./appraisalStatus";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { LocationNamesAll } from "./util";
import { ThrowKind } from "../throw";
import * as pb from "@/proto/etco";
import { withCatchResult } from "../withResult";

export interface ContractQueueEntry extends ContractStatus {
  code: string;
}

export interface ContractQueue {
  locationNamingMaps: pb.LocationNamingMaps;
  queue: ContractQueueEntry[];
}

export interface UserQueueEntry {
  status: UserAppraisalStatus;
  code: string;
}

export interface UserData {
  buybackHistory: UserQueueEntry[];
  shopHistory: UserQueueEntry[];
  madePurchase: number;
  cancelledPurchase: number;
}

export const buybackContractQueue = async (
  token: string,
  throwKind?: ThrowKind
): Promise<ContractQueue> =>
  dispatchAuthenticated(
    pbClient.prototype.buybackContractQueue,
    newContractQueueRequest("buyback", token),
    (rep) => newContractQueue("buyback", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultBuybackContractQueue = withCatchResult(buybackContractQueue);

export const shopContractQueue = async (
  token: string,
  throwKind?: ThrowKind
): Promise<ContractQueue> =>
  dispatchAuthenticated(
    pbClient.prototype.shopContractQueue,
    newContractQueueRequest("shop", token),
    (rep) => newContractQueue("shop", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultShopContractQueue = withCatchResult(shopContractQueue);

export type PurchaseQueue = string[];
export const purchaseQueue = async (
  token: string,
  throwKind?: ThrowKind
): Promise<PurchaseQueue> =>
  dispatchAuthenticated(
    pbClient.prototype.shopPurchaseQueue,
    { auth: { token } },
    (rep) => rep.queue.map((entry) => entry.code),
    throwKind
  );
export const resultPurchaseQueue = withCatchResult(purchaseQueue);

export const userData = async (
  token: string,
  throwKind?: ThrowKind
): Promise<UserData> =>
  dispatchAuthenticated(
    pbClient.prototype.userData,
    { auth: { token } },
    ({
      madePurchase,
      cancelledPurchase,
      buybackAppraisals,
      shopAppraisals,
    }) => ({
      buybackHistory: buybackAppraisals.map((status) =>
        newBuybackUserQueueEntry(status)
      ),
      shopHistory: shopAppraisals.map((status) =>
        newShopUserQueueEntry(status)
      ),
      cancelledPurchase,
      madePurchase,
    }),
    throwKind
  );
export const resultUserData = withCatchResult(userData);

const newBuybackUserQueueEntry = ({
  contract,
  code,
}: pb.BuybackAppraisalStatus): UserQueueEntry => ({
  status: contract ?? null,
  code,
});
const newShopUserQueueEntry = ({
  contract,
  code,
  inPurchaseQueue,
}: pb.ShopAppraisalStatus): UserQueueEntry => ({
  status: contract ?? inPurchaseQueue ? "inPurchaseQueue" : null,
  code,
});

function newContractQueueRequest(
  kind: "buyback",
  token: string
): pb.BuybackContractQueueRequest;
function newContractQueueRequest(
  kind: "shop",
  token: string
): pb.ShopContractQueueRequest;
function newContractQueueRequest(
  _: StoreKind,
  token: string
): pb.BuybackContractQueueRequest | pb.ShopContractQueueRequest {
  return {
    includeLocationInfo: true,
    includeLocationNaming: LocationNamesAll,
    auth: { token },
  };
}

const newContractQueueEntry = (
  kind: StoreKind,
  entry: pb.ContractQueueEntry,
  locationNamingMaps: pb.LocationNamingMaps,
  throwKind?: ThrowKind
): Promise<ContractQueueEntry> => {
  const { contract, contractLocationInfo: locationInfo, code } = entry;
  if (contract === undefined) {
    return throwInvalid(`${code}: contract is undefined`, throwKind);
  } else if (locationInfo === undefined) {
    return throwInvalid(`${code}: locationInfo is undefined`, throwKind);
  }
  return newContractStatus(
    kind,
    contract,
    locationInfo,
    locationNamingMaps,
    throwKind
  ).then((status) => ({ ...status, code }));
};

const newContractQueue = (
  kind: StoreKind,
  {
    locationNamingMaps,
    queue,
  }: pb.BuybackContractQueueResponse | pb.ShopContractQueueResponse,
  throwKind?: ThrowKind
): Promise<ContractQueue> => {
  if (locationNamingMaps === undefined) {
    return throwInvalid("locationNamingMaps is undefined", throwKind);
  }
  return Promise.all(
    queue.map((entry) =>
      newContractQueueEntry(kind, entry, locationNamingMaps, throwKind)
    )
  ).then((queue) => ({
    locationNamingMaps,
    queue,
  }));
};
