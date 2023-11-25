"use server";

import { ThrowKind } from "../throw";
import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { asIs, dispatch } from "./grpc";
import { ICharacter } from "@/browser/character";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { withCatchResult } from "../withResult";

export const characterInfo = async (
  characterId: number,
  admin: boolean = false,
  refreshToken: string = "",
  throwKind?: ThrowKind
): Promise<ICharacter> =>
  dispatch(
    pbClient.prototype.characterInfo,
    { entityId: characterId },
    ({ characterId, name, corporationId, allianceId }) => ({
      id: characterId,
      name,
      corporationId,
      allianceId: allianceId !== 0 ? allianceId : undefined,
      admin,
      refreshToken,
    }),
    throwKind
  );
export const resultCharacterInfo = withCatchResult(characterInfo);

export const corporationInfo = async (
  corporationId: number,
  throwKind?: ThrowKind
): Promise<ICorporation> =>
  dispatch(
    pbClient.prototype.corporationInfo,
    { entityId: corporationId },
    ({ corporationId, name, ticker, allianceId }) => ({
      id: corporationId,
      name,
      ticker,
      allianceId: allianceId !== 0 ? allianceId : undefined,
      isCorp: true,
    }),
    throwKind
  );
export const resultCorporationInfo = withCatchResult(corporationInfo);

export const allianceInfo = async (
  allianceId: number,
  throwKind?: ThrowKind
): Promise<IAlliance> =>
  dispatch(
    pbClient.prototype.allianceInfo,
    { entityId: allianceId },
    ({ allianceId, name, ticker }) => ({
      id: allianceId,
      name,
      ticker,
    }),
    throwKind
  );
export const resultAllianceInfo = withCatchResult(allianceInfo);

export const shopInventory = async (
  locationId: number,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<pb.ShopInventoryResponse> =>
  dispatch(
    pbClient.prototype.shopInventory,
    { locationId, refreshToken },
    asIs,
    throwKind
  );
export const resultShopInventory = withCatchResult(shopInventory);

export interface ParsedItems {
  knownItems: pb.NamedBasicItem[];
  unknownItems: pb.NamedBasicItem[];
}
export const parse = async (
  text: string,
  throwKind?: ThrowKind
): Promise<pb.ParseResponse> =>
  dispatch(
    pbClient.prototype.parse,
    { text },
    ({ knownItems, unknownItems, strs }) => ({
      knownItems,
      unknownItems,
      strs,
    }),
    throwKind
  );
export const resultParse = withCatchResult(parse);

// admin-only endpoint
export const delPurchases = async (
  entries: { code: string; locationId: number }[],
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<{}> =>
  dispatch(
    pbClient.prototype.deletePurchases,
    { entries, refreshToken },
    () => ({}),
    throwKind
  );
export const resultDelPurchases = withCatchResult(delPurchases);

// user endpoint
export const cancelPurchase = async (
  code: string,
  refreshToken: string,
  locationId: number,
  throwKind?: ThrowKind
): Promise<{}> =>
  dispatch(
    pbClient.prototype.cancelPurchase,
    { code, refreshToken, locationId },
    () => ({}),
    throwKind
  );
export const resultCancelPurchase = withCatchResult(cancelPurchase);

export const login = async (
  accessCode: string,
  app: pb.EsiApp,
  throwKind?: ThrowKind
): Promise<ICharacter> =>
  dispatch(
    pbClient.prototype.login,
    { accessCode, app },
    ({ characterId, refreshToken, admin }) =>
      characterInfo(characterId, admin, refreshToken, ThrowKind.Parsed),
    throwKind
  );
