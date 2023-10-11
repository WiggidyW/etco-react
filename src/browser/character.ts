export interface ICharacter {
  refreshToken: string;
  name: string;
  id: number;
  admin: boolean;
  corporationId: number;
  allianceId?: number;
}

export class Character implements ICharacter {
  private constructor(
    readonly refreshToken: string,
    readonly name: string,
    readonly id: number,
    readonly admin: boolean,
    readonly corporationId: number,
    readonly allianceId?: number
  ) {}

  static fromStr(s: string): Character {
    const obj = JSON.parse(s);
    return Character.fromObject(obj);
  }

  static fromObject({
    refreshToken,
    name,
    id,
    admin,
    corporationId,
    allianceId,
  }: any | ICharacter): Character {
    const invalid = (): never => {
      throw new Error("invalid character fields");
    };
    if (typeof refreshToken !== "string") return invalid();
    if (typeof name !== "string") return invalid();
    if (typeof id !== "number") return invalid();
    if (typeof admin !== "boolean") return invalid();
    if (typeof corporationId !== "number") return invalid();
    if (allianceId !== undefined && typeof allianceId !== "number")
      return invalid();
    return new Character(
      refreshToken,
      name,
      id,
      admin,
      corporationId,
      allianceId
    );
  }

  toObject(): ICharacter {
    return { ...this };
  }
}
