"use client";

import { useEffect, useState } from "react";
import { jsonOrStatusError } from "@/utils/fetchUtil";

interface ICharacterInfo {
  corporation_id: number;
  alliance_id?: number;
}

class CharacterInfo implements ICharacterInfo {
  constructor(readonly corporation_id: number, readonly alliance_id?: number) {}

  public get corporationId() { return this.corporation_id; } // prettier-ignore
  public get allianceId() { return this.alliance_id; } // prettier-ignore

  static fromObject = ({
    corporation_id: corporationId,
    alliance_id: allianceId,
  }: any | ICharacterInfo): CharacterInfo => {
    const invalid = (): never => { throw new Error("invalid character info"); }; //prettier-ignore
    if (typeof corporationId !== "number") return invalid();
    if (allianceId !== undefined && typeof allianceId !== "number")
      return invalid();
    return new CharacterInfo(corporationId, allianceId);
  };
}

export const useCharacterInfo = (
  characterId: number
): CharacterInfo | undefined => {
  const [info, setInfo] = useState<CharacterInfo>();
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://esi.evetech.net/latest/characters/${characterId}`
      );
      const data = await jsonOrStatusError(res, `characters/${characterId}`);
      setInfo(CharacterInfo.fromObject(data));
    })();
  }, [characterId]);
  return info;
};
