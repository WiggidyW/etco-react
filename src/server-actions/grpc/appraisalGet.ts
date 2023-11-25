"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { dispatch, throwInvalid } from "./grpc";
import {
  FullAppraisalStatus,
  fullStatusBuybackAppraisal,
  fullStatusShopAppraisal,
} from "./appraisalStatus";
import { ICharacter } from "@/browser/character";
import { Appraisal, toNewAppraisal } from "./appraisal";
import { characterInfo } from "./other";
import { withCatchResult } from "../withResult";

export const getBuybackAppraisal = async (
  code: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<Appraisal | null> =>
  dispatch(
    pbClient.prototype.getBuybackAppraisal,
    getAppraisalRequest(code, character),
    (rep) =>
      newAppraisal({ kind: "buyback", rep }, character, ThrowKind.Parsed),
    throwKind
  );
export const resultGetBuybackAppraisal = withCatchResult(getBuybackAppraisal);

export const getShopAppraisal = async (
  code: string,
  character?: ICharacter,
  throwKind?: ThrowKind
): Promise<Appraisal | null> =>
  dispatch(
    pbClient.prototype.getShopAppraisal,
    getAppraisalRequest(code, character),
    (rep) => newAppraisal({ kind: "shop", rep }, character, ThrowKind.Parsed),
    throwKind
  );
export const resultGetShopAppraisal = withCatchResult(getShopAppraisal);

function getAppraisalRequest(
  code: string,
  character?: ICharacter
): pb.GetAppraisalRequest {
  return {
    code,
    includeItems: true,
    refreshToken: character ? character.refreshToken : "",
  };
}

function newAppraisalRequest(
  territoryId: number,
  items: pb.BasicItem[]
): pb.NewAppraisalRequest {
  return { territoryId, items };
}

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
): Promise<Appraisal | null> {
  if (param.rep.appraisal === undefined) {
    return Promise.resolve(null);
  }

  const isSameCharacter =
    character !== undefined &&
    !param.rep.anonymous &&
    param.rep.appraisal.characterId === character.id;

  let fullStatusPromise: Promise<FullAppraisalStatus>;
  if (character !== undefined && (character?.admin || isSameCharacter)) {
    if (param.kind === "buyback") {
      fullStatusPromise = fullStatusBuybackAppraisal(
        param.rep.appraisal.code,
        character.refreshToken,
        throwKind
      );
    } /* if (param.kind === "shop") */ else {
      fullStatusPromise = fullStatusShopAppraisal(
        param.rep.appraisal.code,
        character.refreshToken,
        throwKind
      );
    }
  } else {
    fullStatusPromise = Promise.resolve(null);
  }

  let appraisalCharacterPromise: Promise<ICharacter | null>;
  if (isSameCharacter) {
    appraisalCharacterPromise = Promise.resolve(character);
  } else if (!param.rep.anonymous && param.rep.appraisal.characterId !== 0) {
    appraisalCharacterPromise = characterInfo(
      param.rep.appraisal.characterId,
      undefined,
      undefined,
      throwKind
    );
  } else {
    appraisalCharacterPromise = Promise.resolve(null);
  }

  if (param.kind === "buyback") {
    const { systemInfo, items } = param.rep.appraisal;
    return Promise.all([
      appraisalCharacterPromise,
      fullStatusPromise,
      dispatch(
        pbClient.prototype.newBuybackAppraisal,
        newAppraisalRequest(
          systemInfo!.systemId,
          items.map((item) => ({
            typeId: item.typeId!.typeId,
            quantity: item.quantity,
          }))
        ),
        ({ appraisal, strs }) => ({
          strs,
          appraisal:
            appraisal ?? throwInvalid("appraisal is undefined", throwKind),
        }),
        throwKind
      ),
    ]).then(([appraisalCharacter, fullStatus, newAppraisalRep]) =>
      toNewAppraisal(
        {
          kind: "buyback",
          appraisal: param.rep.appraisal!,
          newAppraisal: newAppraisalRep.appraisal,
        },
        param.rep.strs,
        newAppraisalRep.strs,
        [],
        fullStatus,
        appraisalCharacter
      )
    );
  } /* if (param.kind === "shop") */ else {
    const { locationInfo, items } = param.rep.appraisal;
    return Promise.all([
      appraisalCharacterPromise,
      fullStatusPromise,
      dispatch(
        pbClient.prototype.newShopAppraisal,
        newAppraisalRequest(
          locationInfo!.locationId,
          items.map((item) => ({
            typeId: item.typeId?.typeId || 0,
            quantity: item.quantity,
          }))
        ),
        ({ appraisal, strs }) => ({
          strs,
          appraisal:
            appraisal ?? throwInvalid("appraisal is undefined", throwKind),
        }),
        throwKind
      ),
    ]).then(([appraisalCharacter, fullStatus, newAppraisalRep]) =>
      toNewAppraisal(
        {
          kind: "shop",
          appraisal: param.rep.appraisal!,
          newAppraisal: newAppraisalRep.appraisal,
        },
        param.rep.strs,
        newAppraisalRep.strs,
        [],
        fullStatus,
        appraisalCharacter
      )
    );
  }
}
