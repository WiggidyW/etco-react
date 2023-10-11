export interface ICorporation {
  id: number;
  name: string;
  ticker: string;
  isCorp: true;
  allianceId?: number;
}

export class Corporation implements ICorporation {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly ticker: string,
    readonly allianceId?: number,
    readonly isCorp: true = true
  ) {}

  static fromObject({
    id,
    name,
    ticker,
    isCorp,
    allianceId,
  }: any | ICorporation): Corporation {
    const invalid = (): never => {
      throw new Error("invalid corporation fields");
    };
    if (typeof id !== "number") return invalid();
    if (typeof name !== "string") return invalid();
    if (typeof ticker !== "string") return invalid();
    if (allianceId !== undefined && typeof allianceId !== "number")
      return invalid();
    if (isCorp !== true) return invalid();
    return new Corporation(id, name, ticker, allianceId);
  }

  static fromStr(s: string): Corporation {
    const obj = JSON.parse(s);
    return Corporation.fromObject(obj);
  }

  toObject(): ICorporation {
    return { ...this };
  }
}
