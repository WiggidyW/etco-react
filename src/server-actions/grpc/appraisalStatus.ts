"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { StoreKind, dispatchAuthenticated, throwInvalid } from "./grpc";
import { ICharacter } from "@/browser/character";
import { allianceInfo, characterInfo, corporationInfo } from "./other";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { ItemNamesOnly, LocationNamesAll } from "./util";

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
  locationInfo: pb.LocationInfo;
  contract: pb.Contract;
  entity: AppraisalEntity;
}

export interface FullContractStatus extends ContractStatus {
  locationNamingMaps: pb.LocationNamingMaps;
  contractItems: pb.ContractItem[];
}

export type UserBuybackAppraisalStatus = pb.Contract | null;
export type UserShopAppraisalStatus = pb.Contract | "inPurchaseQueue" | null;
export type UserAppraisalStatus =
  | UserBuybackAppraisalStatus
  | UserShopAppraisalStatus;

export type BuybackAppraisalStatus = ContractStatus | null;
export type ShopAppraisalStatus = ContractStatus | "inPurchaseQueue" | null;
export type AppraisalStatus = BuybackAppraisalStatus | ShopAppraisalStatus;

export type FullBuybackAppraisalStatus = FullContractStatus | null;
export type FullShopAppraisalStatus =
  | FullContractStatus
  | "inPurchaseQueue"
  | null;
export type FullAppraisalStatus =
  | FullBuybackAppraisalStatus
  | FullShopAppraisalStatus;

export const statusBuybackAppraisal = async (
  code: string,
  admin: boolean,
  token: string,
  throwKind?: ThrowKind
): Promise<FullBuybackAppraisalStatus> =>
  dispatchAuthenticated(
    pbClient.prototype.statusBuybackAppraisal,
    newStatusAppraisalRequest("buyback", code, admin, token),
    (rep) => newFullAppraisalStatus({ kind: "buyback", rep }, ThrowKind.Parsed),
    throwKind
  );

export const statusShopAppraisal = async (
  code: string,
  admin: boolean,
  token: string,
  throwKind?: ThrowKind
): Promise<FullShopAppraisalStatus> =>
  dispatchAuthenticated(
    pbClient.prototype.statusShopAppraisal,
    newStatusAppraisalRequest("shop", code, admin, token),
    (rep) => newFullAppraisalStatus({ kind: "shop", rep }, ThrowKind.Parsed),
    throwKind
  );

function newStatusAppraisalRequest(
  kind: "buyback",
  code: string,
  admin: boolean,
  token: string
): pb.StatusBuybackAppraisalRequest;
function newStatusAppraisalRequest(
  kind: "shop",
  code: string,
  admin: boolean,
  token: string
): pb.StatusShopAppraisalRequest;
function newStatusAppraisalRequest(
  _: StoreKind,
  code: string,
  admin: boolean,
  token: string
): pb.StatusBuybackAppraisalRequest | pb.StatusShopAppraisalRequest {
  return {
    code,
    includeItems: true,
    includeLocationInfo: true,
    includeTypeNaming: ItemNamesOnly,
    includeLocationNaming: LocationNamesAll,
    admin,
    auth: { token },
  };
}

const throwAppraisalStatusInvalid = (
  rep: pb.StatusBuybackAppraisalResponse | pb.StatusShopAppraisalResponse,
  message: string,
  throwKind?: ThrowKind
): never =>
  throwInvalid(message, throwKind, {
    itemCount: rep.contractItems.length,
    contractPresent: rep.contract !== undefined,
    forbiddenStructure: rep.locationInfo?.forbiddenStructure,
    locationNamingMapsPresent: rep.locationNamingMaps !== undefined,
  });

function newFullAppraisalStatus(
  param: { kind: "buyback"; rep: pb.StatusBuybackAppraisalResponse },
  throwKind?: ThrowKind
): Promise<FullBuybackAppraisalStatus>;
function newFullAppraisalStatus(
  param: { kind: "shop"; rep: pb.StatusShopAppraisalResponse },
  throwKind?: ThrowKind
): Promise<FullShopAppraisalStatus>;
function newFullAppraisalStatus(
  param:
    | { kind: "buyback"; rep: pb.StatusBuybackAppraisalResponse }
    | { kind: "shop"; rep: pb.StatusShopAppraisalResponse },
  throwKind?: ThrowKind
): Promise<FullBuybackAppraisalStatus | FullShopAppraisalStatus> {
  const { contract, contractItems, locationInfo, locationNamingMaps } =
    param.rep;

  // return early if there is no contract
  if (param.kind === "shop" && param.rep.inPurchaseQueue) {
    return Promise.resolve("inPurchaseQueue");
  } else if (contract === undefined) {
    return Promise.resolve(null);
  }

  // validate contract data
  else if (locationInfo === undefined) {
    return throwAppraisalStatusInvalid(
      param.rep,
      "locationInfo is undefined",
      throwKind
    );
  } else if (locationNamingMaps === undefined) {
    return throwAppraisalStatusInvalid(
      param.rep,
      "locationNamingMaps is undefined",
      throwKind
    );
  }

  // return contract status
  else {
    return newContractStatus(
      param.kind,
      contract,
      locationInfo,
      locationNamingMaps,
      throwKind
    ).then((contractStatus) => ({
      ...contractStatus,
      contractItems,
      locationNamingMaps,
    }));
  }
}

export const newContractStatus = (
  kind: StoreKind,
  contract: pb.Contract,
  locationInfo: pb.LocationInfo,
  locationNamingMaps: pb.LocationNamingMaps,
  throwKind?: ThrowKind,
  entity?: AppraisalEntity
): Promise<ContractStatus> => {
  // fetch the correct entity according to kind and return status
  if (entity !== undefined) {
    return Promise.resolve({ contract, locationInfo, entity });
  } else if (kind === "shop") {
    return newAssignee(
      contract.assigneeId,
      contract.assigneeType,
      throwKind
    ).then((entity) => ({
      contract,
      locationInfo,
      locationNamingMaps,
      entity,
    }));
  } /* if (param.kind === "buyback") */ else {
    return newIssuer(contract.issuerCharId, throwKind).then((entity) => ({
      contract,
      locationInfo,
      locationNamingMaps,
      entity,
    }));
  }
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
    case pb.ContractAssigneeType.character:
      return characterInfo(assigneeId, undefined, undefined, throwKind).then(
        (character) => ({ kind: "character", entity: character })
      );
    case pb.ContractAssigneeType.corporation:
      return corporationInfo(assigneeId, throwKind).then((corporation) => ({
        kind: "corporation",
        entity: corporation,
      }));
    case pb.ContractAssigneeType.alliance:
      return allianceInfo(assigneeId, throwKind).then((alliance) => ({
        kind: "alliance",
        entity: alliance,
      }));
    case pb.ContractAssigneeType.unknown_assignee_type:
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
