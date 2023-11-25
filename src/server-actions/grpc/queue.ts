"use server";

import { StoreKind, dispatch, throwInvalid } from "./grpc";
import {
  AppraisalStatus,
  ContractStatus,
  newContractStatus,
  statusBuybackAppraisal,
} from "./appraisalStatus";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import * as pb from "@/proto/etco";
import { withCatchResult } from "../withResult";

export interface ContractQueueEntry extends ContractStatus {
  code: string;
}

export interface ContractQueue {
  strs: string[];
  queue: ContractQueueEntry[];
}

export interface UserQueueEntry {
  status: AppraisalStatus;
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
  dispatch(
    pbClient.prototype.buybackContractQueue,
    { refreshToken: token },
    (rep) => newContractQueue("buyback", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultBuybackContractQueue = withCatchResult(buybackContractQueue);

export const shopContractQueue = async (
  token: string,
  throwKind?: ThrowKind
): Promise<ContractQueue> =>
  dispatch(
    pbClient.prototype.shopContractQueue,
    { refreshToken: token },
    (rep) => newContractQueue("shop", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultShopContractQueue = withCatchResult(shopContractQueue);

export const purchaseQueue = async (
  token: string,
  throwKind?: ThrowKind
): Promise<string[]> =>
  dispatch(
    pbClient.prototype.purchaseQueue,
    { refreshToken: token },
    (rep) =>
      Object.values(rep.queue).reduce((acc, { codes }) => {
        codes.forEach((code) => acc.push(code));
        return acc;
      }, [] as string[]),
    throwKind
  );
export const resultPurchaseQueue = withCatchResult(purchaseQueue);

export const userData = async (
  characterId: number,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<UserData> => {
  const request: pb.UserDataRequest = { characterId, refreshToken };
  const [buybackHistory, shopHistory, madePurchase, cancelledPurchase] =
    await Promise.all([
      dispatch(
        pbClient.prototype.userBuybackAppraisalCodes,
        request,
        (rep) =>
          userQueueEntries(
            rep.codes,
            refreshToken,
            statusBuybackAppraisal,
            throwKind
          ),
        throwKind
      ),
      dispatch(
        pbClient.prototype.userShopAppraisalCodes,
        request,
        (rep) =>
          userQueueEntries(
            rep.codes,
            refreshToken,
            statusBuybackAppraisal,
            throwKind
          ),
        throwKind
      ),
      dispatch(
        pbClient.prototype.userMadePurchase,
        request,
        (rep) => rep.time,
        throwKind
      ),
      dispatch(
        pbClient.prototype.userCancelledPurchase,
        request,
        (rep) => rep.time,
        throwKind
      ),
    ]);
  return { buybackHistory, shopHistory, madePurchase, cancelledPurchase };
};
export const resultUserData = withCatchResult(userData);

const userQueueEntries = async (
  codes: string[],
  token: string,
  statusFunc: (
    code: string,
    refreshToken: string,
    throwKind?: ThrowKind
  ) => Promise<AppraisalStatus>,
  throwKind?: ThrowKind
): Promise<UserQueueEntry[]> => {
  return Promise.all(
    codes.map((code) =>
      statusFunc(code, token, throwKind).then((status) => ({ status, code }))
    )
  );
};

const newContractQueueEntry = (
  kind: StoreKind,
  entry: pb.BuybackContractQueueEntry | pb.ShopContractQueueEntry,
  throwKind?: ThrowKind
): Promise<ContractQueueEntry> => {
  const { contract, code } = entry;
  if (contract === undefined) {
    return throwInvalid(`${code}: contract is undefined`, throwKind);
  }
  return newContractStatus(kind, contract, throwKind).then((status) => ({
    ...status,
    code,
  }));
};

const newContractQueue = (
  kind: StoreKind,
  {
    strs,
    queue,
  }: pb.BuybackContractQueueResponse | pb.ShopContractQueueResponse,
  throwKind?: ThrowKind
): Promise<ContractQueue> => {
  return Promise.all(
    queue.map((entry) => newContractQueueEntry(kind, entry, throwKind))
  ).then((queue) => ({
    queue,
    strs,
  }));
};
