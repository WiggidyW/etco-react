import { ModificationState } from "@/components/Configure/modificationState";
import { TypeNamingLists } from "@/proto/etco";
import { ValidShopItem } from "@/server-actions/grpc/other";

export class Record {
  private _marketGroupNames: string[] | null = null;
  private _cartQuantity: number | null = null;

  constructor(
    readonly item: ValidShopItem,
    readonly index: number,
    readonly typeNamingLists: TypeNamingLists
  ) {}

  get typeId(): number {
    return this.item.typeId;
  }
  get quantity(): number {
    return this.item.quantity;
  }
  get pricePerUnit(): number {
    return this.item.pricePerUnit;
  }
  get description(): string {
    return this.item.description;
  }
  get typeName(): string {
    return this.item.typeNamingIndexes.name;
  }
  get groupName(): string {
    return this.typeNamingLists.groups[this.item.typeNamingIndexes.groupIndex];
  }
  get categoryName(): string {
    return this.typeNamingLists.categories[
      this.item.typeNamingIndexes.categoryIndex
    ];
  }
  get marketGroupNames(): string[] {
    if (this._marketGroupNames === null) {
      this._marketGroupNames =
        this.item.typeNamingIndexes.marketGroupIndexes.map(
          (index) => this.typeNamingLists.marketGroups[index]
        );
    }
    return this._marketGroupNames;
  }

  get rowKey(): number {
    return this.typeId;
  }

  getModificationState(): ModificationState {
    if (this._cartQuantity === null) {
      return ModificationState.Unmodified;
    } else if (this._cartQuantity === 0) {
      return ModificationState.Deleted;
    } else {
      return ModificationState.Modified;
    }
  }

  get priceTotal(): number {
    return this.quantity ? this.quantity * this.pricePerUnit : 0;
  }
  get cartQuantity(): number | null {
    return this._cartQuantity;
  }
  set cartQuantity(value: number | null) {
    // console.log(value);
    this._cartQuantity = value;
  }
}
