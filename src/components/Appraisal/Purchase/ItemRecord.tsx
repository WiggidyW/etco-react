import { ModificationState } from "@/components/Configure/modificationState";
import { ShopItem } from "@/proto/etco";

export class Record {
  private _marketGroupNames: string[] | null = null;
  private _cartQuantity: number | null = null;

  constructor(
    readonly item: ShopItem,
    readonly index: number,
    readonly strs: string[]
  ) {}

  get typeId(): number {
    return this.item.typeId!.typeId;
  }
  get quantity(): number {
    return this.item.quantity;
  }
  get pricePerUnit(): number {
    return this.item.pricePerUnit;
  }
  get description(): string {
    return this.strs[this.item.descriptionStrIndex];
  }
  get typeName(): string {
    return this.strs[this.item.typeId!.typeStrIndex];
  }
  get groupName(): string {
    return this.strs[this.item.typeId!.groupStrIndex];
  }
  get categoryName(): string {
    return this.strs[this.item.typeId!.categoryStrIndex];
  }
  get marketGroupNames(): string[] {
    if (this._marketGroupNames === null) {
      this._marketGroupNames = this.item.typeId!.marketGroupStrIndexes.map(
        (index) => this.strs[index]
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
  get availableQuantity(): number {
    return this.quantity - (this._cartQuantity ?? 0);
  }
}
