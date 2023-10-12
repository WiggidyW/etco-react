"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { asIs, dispatch, dispatchAuthenticated, throwInvalid } from "./grpc";
import { ICharacter } from "@/browser/character";
import { BuybackAppraisal, ShopAppraisal, toNewAppraisal } from "./appraisal";
import { parse } from "./other";
import { EmptyPbBuybackAppraisal, ItemNamesOnly } from "./util";
import { withCatchResult } from "../withResult";

export interface ParsedBuybackAppraisal {
  unknownItems: pb.NamedBasicItem[];
  appraisal: pb.BuybackAppraisal | null;
}
export const parseNewBuybackAppraisal = async (
  systemId: number,
  text: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<BuybackAppraisal> => {
  const { knownItems, unknownItems } = await parse(text, throwKind);
  if (knownItems.length === 0) {
    return toNewAppraisal(
      { kind: "buyback", appraisal: EmptyPbBuybackAppraisal },
      character,
      unknownItems
    );
  }

  if (Math.random() > 0.999) {
    return throwInvalid(
      "👻👻 you have been haunted by the appraisal ghost 👻👻",
      throwKind,
      {
        Ghost: true,
        Spooky: true,
        "Oh No": "Indeed",
      }
    );
  }

  const dispatchEither = character ? dispatchAuthenticated : dispatch;
  const appraisal = await dispatchEither(
    pbClient.prototype.newBuybackAppraisal,
    {
      systemId,
      save: true,
      items: knownItems,
      auth: character ? { token: character.refreshToken } : undefined,
      includeTypeNaming: ItemNamesOnly,
    },
    ({ appraisal }) =>
      appraisal ?? throwInvalid("appraisal is undefined", throwKind),
    throwKind
  );

  return toNewAppraisal(
    { kind: "buyback", appraisal },
    character,
    unknownItems
  );
};
export const resultParseNewBuybackAppraisal = withCatchResult(
  parseNewBuybackAppraisal
);

export interface MakePurchaseAppraisal {
  makePurchaseStatus: pb.MakePurchaseStatus;
  appraisal?: ShopAppraisal;
}
export const shopMakePurchase = async (
  locationId: number,
  items: pb.BasicItem[],
  character: ICharacter,
  throwKind?: ThrowKind
): Promise<MakePurchaseAppraisal> => {
  const { appraisal, status: makePurchaseStatus } = await dispatchAuthenticated(
    pbClient.prototype.shopMakePurchase,
    {
      locationId,
      items,
      includeTypeNaming: ItemNamesOnly,
      auth: { token: character.refreshToken },
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
        { kind: "shop", appraisal, fullStatus: "inPurchaseQueue" },
        character
      ),
    };
  }
};
export const resultShopMakePurchase = withCatchResult(shopMakePurchase);
