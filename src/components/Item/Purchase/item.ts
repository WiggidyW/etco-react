interface IPurchaseItem {
  typeId: number;
  quantity: number;
  pricePer: number;
  description: string;
  location: string;
  name: string;
  marketGroups: string[];
  group: string;
  category: string;
}

export class PurchaseItem implements IPurchaseItem {
  public inCart: number;
  public marketGroupsSet: Set<string>;
  public nameLower: string;

  constructor(
    readonly typeId: number,
    readonly quantity: number,
    readonly pricePer: number,
    readonly description: string,
    readonly location: string,
    readonly name: string,
    readonly marketGroups: string[],
    readonly group: string,
    readonly category: string,
    inCart?: number,
    marketGroupsSet?: Set<string>,
    nameLower?: string
  ) {
    this.inCart = inCart ?? 0;
    this.marketGroupsSet = marketGroupsSet ?? new Set(marketGroups);
    this.nameLower = nameLower ?? name.toLowerCase();
  }

  static fromObject = ({
    typeId,
    quantity,
    pricePer,
    description,
    location,
    name,
    marketGroups,
    group,
    category,
  }: any | IPurchaseItem): PurchaseItem => {
    return new PurchaseItem(
      typeId,
      quantity,
      pricePer,
      description,
      location,
      name,
      marketGroups,
      group,
      category,
      undefined
    );
  };

  clone = (): PurchaseItem => {
    return new PurchaseItem(
      this.typeId,
      this.quantity,
      this.pricePer,
      this.description,
      this.location,
      this.name,
      this.marketGroups,
      this.group,
      this.category,
      this.inCart
    );
  };
}
