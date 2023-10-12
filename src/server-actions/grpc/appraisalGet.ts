"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import {
  StoreKind,
  dispatch,
  dispatchAuthenticated,
  throwInvalid,
} from "./grpc";
import {
  FullBuybackAppraisalStatus,
  FullShopAppraisalStatus,
  statusBuybackAppraisal,
  statusShopAppraisal,
} from "./appraisalStatus";
import { ICharacter } from "@/browser/character";
import { BuybackAppraisal, ShopAppraisal, toNewAppraisal } from "./appraisal";
import {
  NULL_OBFUSCATED,
  newPBObfuscateCharacterID,
} from "@/shared/obfuscatedCharacterId";
import { characterInfo } from "./other";
import { ItemNamesOnly } from "./util";
import { withCatchResult } from "../withResult";

export const getBuybackAppraisal = async (
  code: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<BuybackAppraisal | null> => {
  const dispatchEither = character?.admin ? dispatchAuthenticated : dispatch;
  return dispatchEither(
    pbClient.prototype.getBuybackAppraisal,
    getAppraisalRequest("buyback", code, character),
    (rep) =>
      newAppraisal({ kind: "buyback", rep }, character, ThrowKind.Parsed),
    throwKind
  );
};
export const resultGetBuybackAppraisal = withCatchResult(getBuybackAppraisal);

export const getShopAppraisal = async (
  code: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<ShopAppraisal | null> => {
  const dispatchEither = character?.admin ? dispatchAuthenticated : dispatch;
  return dispatchEither(
    pbClient.prototype.getShopAppraisal,
    getAppraisalRequest("shop", code, character),
    (rep) => newAppraisal({ kind: "shop", rep }, character, ThrowKind.Parsed),
    throwKind
  );
};
export const resultGetShopAppraisal = withCatchResult(getShopAppraisal);

function getAppraisalRequest(
  kind: "buyback",
  code: string,
  character?: ICharacter
): pb.GetBuybackAppraisalRequest;
function getAppraisalRequest(
  kind: "shop",
  code: string,
  character?: ICharacter
): pb.GetShopAppraisalRequest;
function getAppraisalRequest(
  _: StoreKind,
  code: string,
  character?: ICharacter
): pb.GetBuybackAppraisalRequest | pb.GetShopAppraisalRequest {
  return {
    code,
    admin: character?.admin ?? false,
    includeTypeNaming: ItemNamesOnly,
    ...(character ? { auth: { token: character.refreshToken } } : {}),
  };
}

function newAppraisalRequest(
  param: {
    kind: "buyback";
    systemId: number;
  },
  items: pb.BasicItem[]
): pb.NewBuybackAppraisalRequest;
function newAppraisalRequest(
  param: {
    kind: "shop";
    locationId: number;
  },
  items: pb.BasicItem[]
): pb.NewShopAppraisalRequest;
function newAppraisalRequest(
  param:
    | {
        kind: "buyback";
        systemId: number;
      }
    | {
        kind: "shop";
        locationId: number;
      },
  items: pb.BasicItem[]
): pb.NewBuybackAppraisalRequest | pb.NewShopAppraisalRequest {
  const { kind, ...reqParam } = param;
  return {
    ...reqParam,
    items,
    save: false,
    includeTypeNaming: ItemNamesOnly,
  };
}

function newAppraisal(
  param: {
    kind: "buyback";
    rep: pb.GetBuybackAppraisalResponse;
  },
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<BuybackAppraisal>;
function newAppraisal(
  param: {
    kind: "shop";
    rep: pb.GetShopAppraisalResponse;
  },
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<ShopAppraisal>;
function newAppraisal(
  param:
    | {
        kind: "buyback";
        rep: pb.GetBuybackAppraisalResponse;
      }
    | {
        kind: "shop";
        rep: pb.GetShopAppraisalResponse;
      },
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<BuybackAppraisal | ShopAppraisal> {
  if (param.rep.appraisal === undefined) {
    return throwInvalid("appraisal is undefined", throwKind);
  }

  const { admin, refreshToken } = character ?? { admin: false };
  const { characterId: adminOnlyCharacterId, hashCharacterId } = param.rep;

  const isAnonymous = hashCharacterId === NULL_OBFUSCATED;
  const isSameCharacter =
    character !== undefined &&
    !isAnonymous &&
    (admin
      ? character.id === adminOnlyCharacterId // if admin, don't check obfuscated
      : hashCharacterId === newPBObfuscateCharacterID(character.id));

  let fullStatusPromise:
    | Promise<FullBuybackAppraisalStatus>
    | Promise<FullShopAppraisalStatus>;
  let appraisalCharacterPromise: Promise<ICharacter | null>;
  // let newAppraisalPromise: Promise<pb.BuybackAppraisal> | Promise<pb.ShopAppraisal>;

  if (
    !isAnonymous &&
    (isSameCharacter || admin) &&
    refreshToken !== undefined
  ) {
    // fullStatusPromise
    if (param.kind === "buyback") {
      fullStatusPromise = statusBuybackAppraisal(
        param.rep.appraisal.code,
        admin,
        refreshToken,
        throwKind
      );
    } /* if (param.kind === "shop") */ else {
      fullStatusPromise = statusShopAppraisal(
        param.rep.appraisal.code,
        admin,
        refreshToken,
        throwKind
      );
    }
    // newAppraisalPromise
    if (isSameCharacter) {
      appraisalCharacterPromise = Promise.resolve(character);
    } /* if (admin) */ else {
      appraisalCharacterPromise = characterInfo(
        adminOnlyCharacterId,
        undefined,
        undefined,
        throwKind
      );
    }
  } /* if (isAnonymous || not admin and not same character) */ else {
    appraisalCharacterPromise = Promise.resolve(null);
    fullStatusPromise = Promise.resolve(null);
  }

  if (param.kind === "buyback") {
    const { systemId, items } = param.rep.appraisal;
    return Promise.all([
      appraisalCharacterPromise,
      fullStatusPromise,
      dispatch(
        pbClient.prototype.newBuybackAppraisal,
        newAppraisalRequest({ kind: "buyback", systemId }, items),
        ({ appraisal }) =>
          appraisal ?? throwInvalid("appraisal is undefined", throwKind),
        throwKind
      ),
    ]).then(([appraisalCharacter, fullStatus, newAppraisal]) =>
      toNewAppraisal(
        {
          kind: "buyback",
          appraisal: param.rep.appraisal!,
          newAppraisal,
          fullStatus: fullStatus as FullBuybackAppraisalStatus,
        },
        appraisalCharacter
      )
    );
  } /* if (param.kind === "shop") */ else {
    const { locationId, items } = param.rep.appraisal;
    return Promise.all([
      appraisalCharacterPromise,
      fullStatusPromise,
      dispatch(
        pbClient.prototype.newShopAppraisal,
        newAppraisalRequest({ kind: "shop", locationId }, items),
        ({ appraisal }) =>
          appraisal ?? throwInvalid("appraisal is undefined", throwKind),
        throwKind
      ),
    ]).then(([appraisalCharacter, fullStatus, newAppraisal]) =>
      toNewAppraisal(
        {
          kind: "shop",
          appraisal: param.rep.appraisal!,
          newAppraisal,
          fullStatus: fullStatus as FullShopAppraisalStatus,
        },
        appraisalCharacter
      )
    );
  }
}
