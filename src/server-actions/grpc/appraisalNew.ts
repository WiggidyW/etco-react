"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { asIs, dispatch, throwInvalid } from "./grpc";
import { ICharacter } from "@/browser/character";
import { Appraisal, toNewAppraisal } from "./appraisal";
import { parse } from "./other";
import { NewEmptyPbBuybackAppraisal, NewEmptyPbStrs } from "./util";
import { withCatchResult } from "../withResult";

export const parseAsAppraisal = async (
  text: string,
  throwKind?: ThrowKind
): Promise<Appraisal> => {
  const { knownItems, unknownItems, strs } = await parse(text, throwKind);
  return toNewAppraisal(
    {
      kind: "shop",
      appraisal: {
        rejected: false,
        code: "",
        time: Math.floor(Date.now() / 1000),
        items: knownItems.map(({ typeId, quantity }) => ({
          typeId,
          quantity,
          pricePerUnit: 0,
          descriptionStrIndex: 0,
        })),
        version: "parse",
        characterId: 0,
        locationInfo: {
          locationId: 0,
          locationStrIndex: 0,
          isStructure: false,
          forbiddenStructure: false,
          systemInfo: {
            systemId: 0,
            systemStrIndex: 0,
            regionId: 0,
            regionStrIndex: 0,
          },
        },
        price: 0,
        taxRate: 0,
        tax: 0,
      },
    },
    NewEmptyPbStrs(),
    [],
    strs,
    undefined,
    undefined,
    unknownItems
  );
};
export const resultParseAsAppraisal = withCatchResult(parseAsAppraisal);

export const parseNewBuybackAppraisal = async (
  systemId: number,
  text: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<Appraisal> => {
  const {
    knownItems,
    unknownItems,
    strs: parseStrs,
  } = await parse(text, throwKind);
  if (knownItems.length === 0) {
    return toNewAppraisal(
      {
        kind: "buyback",
        appraisal: NewEmptyPbBuybackAppraisal(),
      },
      NewEmptyPbStrs(),
      [],
      parseStrs,
      undefined,
      character,
      unknownItems
    );
  }

  const { appraisal, strs: appraisalStrs } = await dispatch(
    pbClient.prototype.saveBuybackAppraisal,
    {
      territoryId: systemId,
      items: knownItems.map(({ typeId, quantity }) => ({
        typeId: typeId!.typeId,
        quantity,
      })),
      refreshToken: character ? character.refreshToken : "",
    },
    ({ strs, appraisal }) => ({
      strs,
      appraisal: appraisal ?? throwInvalid("appraisal is undefined", throwKind),
    }),
    throwKind
  );

  return toNewAppraisal(
    {
      kind: "buyback",
      appraisal,
    },
    appraisalStrs,
    [],
    parseStrs,
    undefined,
    character,
    unknownItems
  );
};
export const resultParseNewBuybackAppraisal = withCatchResult(
  parseNewBuybackAppraisal
);

export interface MakePurchaseAppraisal {
  makePurchaseStatus: pb.MakePurchaseStatus;
  appraisal?: Appraisal;
}
export const shopMakePurchase = async (
  locationId: number,
  items: pb.BasicItem[],
  character: ICharacter,
  throwKind?: ThrowKind
): Promise<MakePurchaseAppraisal> => {
  const {
    appraisal,
    status: makePurchaseStatus,
    strs,
  } = await dispatch(
    pbClient.prototype.saveShopAppraisal,
    {
      territoryId: locationId,
      items,
      refreshToken: character.refreshToken,
    },
    asIs,
    throwKind
  );
  if (appraisal === undefined) {
    return { makePurchaseStatus };
  } else {
    return {
      makePurchaseStatus,
      appraisal: toNewAppraisal(
        {
          kind: "shop",
          appraisal,
        },
        strs,
        [],
        [],
        "inPurchaseQueue",
        character
      ),
    };
  }
};
export const resultShopMakePurchase = withCatchResult(shopMakePurchase);
