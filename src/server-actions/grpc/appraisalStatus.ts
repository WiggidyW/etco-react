"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { StoreKind, dispatch, throwInvalid } from "./grpc";
import { ICharacter } from "@/browser/character";
import { allianceInfo, characterInfo, corporationInfo } from "./other";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { withCatchResult } from "../withResult";

export type AppraisalEntity =
  | {
      kind: "character";
      entity: ICharacter;
    }
  | {
      kind: "corporation";
      entity: ICorporation;
    }
  | {
      kind: "alliance";
      entity: IAlliance;
    };

export interface ContractStatus {
  contract: pb.Contract;
  entity: AppraisalEntity;
}

export interface ContractStatusWithStrs extends ContractStatus {
  strs: string[];
}

export interface FullContractStatus extends ContractStatusWithStrs {
  contractItems: pb.NamedBasicItem[];
}

export type AppraisalStatus = ContractStatusWithStrs | "inPurchaseQueue" | null;
export type FullAppraisalStatus = FullContractStatus | "inPurchaseQueue" | null;

export const statusBuybackAppraisal = async (
  code: string,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<AppraisalStatus> =>
  dispatch(
    pbClient.prototype.statusBuybackAppraisal,
    { code, includeItems: false, refreshToken },
    (rep) => newAppraisalStatus("buyback", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultStatusBuybackAppraisal = withCatchResult(
  statusBuybackAppraisal
);

export const statusShopAppraisal = async (
  code: string,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<AppraisalStatus> =>
  dispatch(
    pbClient.prototype.statusShopAppraisal,
    { code, includeItems: false, refreshToken },
    (rep) => newAppraisalStatus("shop", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultStatusShopAppraisal = withCatchResult(statusShopAppraisal);

export const fullStatusBuybackAppraisal = async (
  code: string,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<FullAppraisalStatus> =>
  dispatch(
    pbClient.prototype.statusBuybackAppraisal,
    { code, includeItems: true, refreshToken },
    (rep) => newFullAppraisalStatus("buyback", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultFullStatusBuybackAppraisal = withCatchResult(
  fullStatusBuybackAppraisal
);

export const fullStatusShopAppraisal = async (
  code: string,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<FullAppraisalStatus> =>
  dispatch(
    pbClient.prototype.statusShopAppraisal,
    { code, includeItems: true, refreshToken },
    (rep) => newFullAppraisalStatus("shop", rep, ThrowKind.Parsed),
    throwKind
  );
export const resultFullStatusShopAppraisal = withCatchResult(
  fullStatusShopAppraisal
);

const throwAppraisalStatusInvalid = (
  rep: pb.StatusAppraisalResponse,
  message: string,
  throwKind?: ThrowKind
): never =>
  throwInvalid(message, throwKind, {
    itemCount: rep.contractItems.length,
    contractPresent: rep.contract !== undefined,
    forbiddenStructure: rep.contract?.locationInfo?.forbiddenStructure,
  });

export const newContractStatus = (
  kind: StoreKind,
  contract: pb.Contract,
  throwKind?: ThrowKind,
  entity?: AppraisalEntity
): Promise<ContractStatus> => {
  // fetch the correct entity according to kind and return status
  if (entity !== undefined) {
    return Promise.resolve({ contract, entity });
  } else if (kind === "shop") {
    return newAssignee(
      contract.assigneeId,
      contract.assigneeType,
      throwKind
    ).then((entity) => ({
      contract,
      entity,
    }));
  } /* if (param.kind === "buyback") */ else {
    return newIssuer(contract.issuerCharId, throwKind).then((entity) => ({
      contract,
      entity,
    }));
  }
};

export const newAppraisalStatus = (
  kind: StoreKind,
  rep: pb.StatusAppraisalResponse,
  throwKind?: ThrowKind
): Promise<AppraisalStatus> => {
  const { status, contract, strs } = rep;

  // return early if there is no contract
  if (status === pb.AppraisalStatus.AS_PURCHASE_QUEUE) {
    return Promise.resolve("inPurchaseQueue");
  } else if (status === pb.AppraisalStatus.AS_UNDEFINED) {
    return Promise.resolve(null);
  } else if (contract === undefined) {
    return throwAppraisalStatusInvalid(rep, "contract is undefined", throwKind);
  }

  // return contract status
  else {
    return newContractStatus(kind, contract, throwKind).then((status) => ({
      ...status,
      strs,
    }));
  }
};

export const newFullAppraisalStatus = (
  kind: StoreKind,
  rep: pb.StatusAppraisalResponse,
  throwKind?: ThrowKind
): Promise<FullAppraisalStatus> => {
  return newAppraisalStatus(kind, rep, throwKind).then((status) => {
    if (status === null || status === "inPurchaseQueue") {
      return status;
    } else {
      return { ...status, contractItems: rep.contractItems, strs: rep.strs };
    }
  });
};

const newIssuer = (
  issuerId: number,
  throwKind?: ThrowKind
): Promise<AppraisalEntity> =>
  characterInfo(issuerId, undefined, undefined, throwKind).then(
    (character) => ({
      kind: "character",
      entity: character,
    })
  );

const newAssignee = (
  assigneeId: number,
  assigneeType: pb.ContractAssigneeType,
  throwKind?: ThrowKind
): Promise<AppraisalEntity> => {
  switch (assigneeType) {
    case pb.ContractAssigneeType.CAT_CHARACTER:
      return characterInfo(assigneeId, undefined, undefined, throwKind).then(
        (character) => ({ kind: "character", entity: character })
      );
    case pb.ContractAssigneeType.CAT_CORPORATION:
      return corporationInfo(assigneeId, throwKind).then((corporation) => ({
        kind: "corporation",
        entity: corporation,
      }));
    case pb.ContractAssigneeType.CAT_ALLIANCE:
      return allianceInfo(assigneeId, throwKind).then((alliance) => ({
        kind: "alliance",
        entity: alliance,
      }));
    case pb.ContractAssigneeType.CAT_UNKNOWN:
      return Promise.resolve({
        kind: "character",
        entity: {
          id: 0,
          name: "Unknown",
          corporationId: -1,
          admin: false,
          refreshToken: "",
        },
      });
  }
};
