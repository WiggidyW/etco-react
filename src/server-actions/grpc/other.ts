"use server";

import { ThrowKind } from "../throw";
import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { dispatch, dispatchAuthenticated, throwInvalid } from "./grpc";
import { ICharacter } from "@/browser/character";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { TypeNamesAll } from "./util";

export const characterInfo = async (
  characterId: number,
  admin: boolean = false,
  refreshToken: string = "",
  throwKind?: ThrowKind
): Promise<ICharacter> =>
  dispatch(
    pbClient.prototype.characterInfo,
    { characterId },
    ({ characterId, name, corporationId, allianceId }) => ({
      id: characterId,
      name,
      corporationId,
      allianceId: allianceId?.inner,
      admin,
      refreshToken,
    }),
    throwKind
  );

export const corporationInfo = async (
  corporationId: number,
  throwKind?: ThrowKind
): Promise<ICorporation> =>
  dispatch(
    pbClient.prototype.corporationInfo,
    { corporationId },
    ({ corporationId, name, ticker, allianceId }) => ({
      id: corporationId,
      name,
      ticker,
      allianceId: allianceId?.inner,
      isCorp: true,
    }),
    throwKind
  );

export const allianceInfo = async (
  allianceId: number,
  throwKind?: ThrowKind
): Promise<IAlliance> =>
  dispatch(
    pbClient.prototype.allianceInfo,
    { allianceId },
    ({ allianceId, name, ticker }) => ({
      id: allianceId,
      name,
      ticker,
    }),
    throwKind
  );

export interface ValidShopItem extends Omit<pb.ShopItem, "typeNamingIndexes"> {
  typeNamingIndexes: pb.TypeNamingIndexes;
}
export interface ShopInventory {
  items: ValidShopItem[];
  typeNamingLists: pb.TypeNamingLists;
}
export const shopInventory = async (
  locationId: number,
  token: string,
  throwKind?: ThrowKind
): Promise<ShopInventory> =>
  dispatchAuthenticated(
    pbClient.prototype.shopInventory,
    { locationId, includeTypeNaming: TypeNamesAll, auth: { token } },
    ({ items, typeNamingLists }) => {
      for (const item of items) {
        if (item.typeNamingIndexes === undefined) {
          throwInvalid(
            `typeId ${item.typeId}: typeNamingIndexes is undefined`,
            throwKind
          );
        } else if (item.typeNamingIndexes.categoryIndex === -1) {
          throwInvalid(`typeId ${item.typeId}: categoryIndex is -1`, throwKind);
        } else if (item.typeNamingIndexes.groupIndex === -1) {
          throwInvalid(`typeId ${item.typeId}: groupIndex is -1`, throwKind);
        }
      }
      return {
        items: items as ValidShopItem[],
        typeNamingLists:
          typeNamingLists ??
          throwInvalid("typeNamingLists is undefined", throwKind),
      };
    },
    throwKind
  );

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
    ({ knownItems, unknownItems }) => ({ knownItems, unknownItems }),
    throwKind
  );

export const isAdmin = async (
  token: string,
  throwKind?: ThrowKind
): Promise<boolean> =>
  dispatch(
    pbClient.prototype.isAdmin,
    { auth: { token } },
    (rep) => rep.isAdmin,
    throwKind
  );

// admin-only endpoint
export const delPurchases = async (
  codes: string[],
  token: string,
  throwKind?: ThrowKind
): Promise<{}> =>
  dispatchAuthenticated(
    pbClient.prototype.shopDeletePurchases,
    { codes, auth: { token } },
    () => ({}),
    throwKind
  );

// user endpoint
export const cancelPurchase = async (
  code: string,
  token: string,
  throwKind?: ThrowKind
): Promise<{}> =>
  dispatchAuthenticated(
    pbClient.prototype.shopCancelPurchase,
    { code, auth: { token } },
    () => ({}),
    throwKind
  );
