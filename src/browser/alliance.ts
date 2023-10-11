export interface IAlliance {
  id: number;
  name: string;
  ticker: string;
}

export class Alliance implements IAlliance {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly ticker: string
  ) {}

  static fromObject({ id, name, ticker }: any | IAlliance): Alliance {
    const invalid = (): never => {
      throw new Error("invalid alliance fields");
    };
    if (typeof id !== "number") return invalid();
    if (typeof name !== "string") return invalid();
    if (typeof ticker !== "string") return invalid();
    return new Alliance(id, name, ticker);
  }

  static fromStr(s: string): Alliance {
    const obj = JSON.parse(s);
    return Alliance.fromObject(obj);
  }

  toObject(): IAlliance {
    return { ...this };
  }
}
