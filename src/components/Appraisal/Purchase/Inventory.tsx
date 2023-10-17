"use client";

import { LocaleText, formatPrice, formatQuantity } from "../Util";
import { ModificationState } from "../../Configure/modificationState";
import { ContentBookend, VerticalBookend } from "../../Bookend";
import { AppraisalItem } from "@/server-actions/grpc/appraisal";
import { BasicItem, TypeNamingLists } from "@/proto/etco";
import { ErrorBoundaryTryAgain } from "../../ErrorBoundary";
import AntTable, { ColumnType } from "antd/es/table";
import { FooterButton } from "../../Input/FooterButton";
import { ReactElement, useState } from "react";
import { rowClassName } from "../../Table/Table";
import { Button } from "../../Input/Manipulator";
import { ContentPortal } from "../../Content";
import classNames from "classnames";
import { Popup } from "../../Popup";
import { LocationSelectProps, LocationSelect } from "../LocationSelect";
import { AppraisalTablePartialAppraisal, AppraisalTable } from "../Table/Table";
import {
  useSearchableMarketGroupColumn,
  useSearchableCategoryColumn,
  useSearchableTypeNameColumn,
  useSearchableGroupColumn,
  PricePerUnitColumn,
  DescriptionColumn,
  QuantityColumn,
  CartColumn,
} from "../../Table/Column";
import { ValidShopItem } from "@/server-actions/grpc/other";

interface CartInfo {
  price: number;
  quantity: number;
}

export interface ShopInventoryProps
  extends Omit<LocationSelectProps, "className"> {
  items: ValidShopItem[];
  typeNamingLists: TypeNamingLists;
  onCheckout: (items: BasicItem[]) => void;
}
export const ShopInventory = ({
  items,
  typeNamingLists,
  onCheckout,
  ...locationSelectProps
}: ShopInventoryProps): ReactElement => {
  const [viewingCart, setViewingCart] = useState(false);
  const [cartInfo, setCartInfo] = useState<CartInfo>({ price: 0, quantity: 0 });
  const [records, setRecords] = useState<Record[]>(() =>
    items.map((item, i) => new Record(item, i, typeNamingLists))
  );

  const setCartQuantity = (index: number, quantity: number | null): void => {
    const newRecords = [...records];
    const newCartInfo = { ...cartInfo };
    const newRecord = newRecords[index];
    const newQuantityDiff = (quantity ?? 0) - (newRecord.cartQuantity ?? 0);

    // update cart info
    newCartInfo.quantity += newQuantityDiff;
    if (newCartInfo.quantity === 0) {
      newCartInfo.price = 0;
    } else {
      newCartInfo.price += newQuantityDiff * newRecord.pricePerUnit;
    }

    // update record
    newRecord.cartQuantity = quantity;

    setCartInfo(newCartInfo);
    setRecords(newRecords);
  };

  return (
    <ContentBookend
      bookendPosition="bottom"
      bookend={
        <Footer
          cartInfo={cartInfo}
          switchViewingCart={() => setViewingCart(!viewingCart)}
        />
      }
    >
      <ErrorBoundaryTryAgain>
        {viewingCart && (
          <Cart
            records={records}
            price={cartInfo.price}
            onCheckout={onCheckout}
            onCancel={() => setViewingCart(false)}
          />
        )}
        <LocationSelect
          className={classNames("pt-2", "ml-auto", "mr-auto")}
          {...locationSelectProps}
        />
        <div className={classNames("p-4", "w-full")}>
          <InventoryTable records={records} setCartQuantity={setCartQuantity} />
        </div>
      </ErrorBoundaryTryAgain>
    </ContentBookend>
  );
};

interface FooterProps {
  cartInfo: CartInfo;
  switchViewingCart: () => void;
}
const Footer = ({ cartInfo, switchViewingCart }: FooterProps): ReactElement => (
  <VerticalBookend
    height={undefined}
    className={classNames("flex", "items-center")}
  >
    <span
      className={classNames(
        "flex-grow",
        "basis-0",
        "ml-1",
        "mr-1",
        "text-right"
      )}
    >
      <LocaleText fmt={formatPrice} v={cartInfo.price} />
    </span>
    <FooterButton canClick={cartInfo.quantity > 0} onClick={switchViewingCart}>
      View Cart
    </FooterButton>
    <span className={classNames("flex-grow", "basis-0", "mr-1")} />
  </VerticalBookend>
);

class Record {
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

const newCartAppraisalItems = (records: Record[]): AppraisalItem[] => {
  const items: AppraisalItem[] = [];
  for (const {
    typeId,
    typeName,
    pricePerUnit,
    description,
    cartQuantity,
  } of records) {
    if (cartQuantity ?? 0 > 0) {
      items.push({
        typeId,
        name: typeName,
        pricePerUnit,
        newPricePerUnit: true,
        description,
        newDescription: true,
        quantity: cartQuantity ?? 0,
        contractQuantity: true,
        children: [],
      });
    }
  }
  return items;
};

const newCartAppraisal = (
  records: Record[],
  price: number
): AppraisalTablePartialAppraisal => ({
  price,
  newPrice: true,
  time: Date.now() / 1000,
  newTime: true,
  version: "Cart",
  newVersion: true,
  items: newCartAppraisalItems(records),
  status: null,
});

interface CartProps {
  records: Record[];
  price: number;
  onCheckout: (items: BasicItem[]) => void;
  onCancel: () => void;
}
const Cart = ({
  records,
  price,
  onCheckout,
  onCancel,
}: CartProps): ReactElement => {
  const appraisal = newCartAppraisal(records, price);
  return (
    <ContentPortal>
      <Popup
        onClickOutside={onCancel}
        percentage={"85"}
        footer={
          <Button
            className={classNames("p-1")}
            variant="success"
            onClick={() => onCheckout(appraisal.items)}
            noPad
          >
            Checkout
          </Button>
        }
        footerClassName={classNames("flex", "justify-center")}
      >
        <AppraisalTable appraisal={appraisal} />
      </Popup>
    </ContentPortal>
  );
};

interface InventoryTableProps {
  records: Record[];
  setCartQuantity: (index: number, quantity: number | null) => void;
}
const InventoryTable = ({
  records,
  setCartQuantity,
}: InventoryTableProps): ReactElement => {
  const columns: ColumnType<Record>[] = [
    useSearchableTypeNameColumn(undefined, true),
    CartColumn(
      (record, quantity) => setCartQuantity(record.index, quantity),
      "whitespace-nowrap"
    ),
    QuantityColumn("whitespace-nowrap"),
    PricePerUnitColumn("whitespace-nowrap"),
    DescriptionColumn(),
    useSearchableGroupColumn("text-sm"),
    useSearchableCategoryColumn("text-sm"),
    useSearchableMarketGroupColumn("text-sm", 2),
  ];
  return (
    <AntTable
      // className={classNames("whitespace-nowrap")}
      dataSource={records}
      rowKey={(record) => record.rowKey}
      rowClassName={(record) => rowClassName(record)}
      columns={columns}
    />
  );
};
