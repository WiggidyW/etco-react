"use client";

import { ContentBookend } from "../../Bookend";
import { ShopAppraisal } from "@/server-actions/grpc/appraisal";
import { BasicItem } from "@/proto/etco";
import { ErrorBoundaryTryAgain } from "../../ErrorBoundary";
import {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "classnames";
import { resultParseAsAppraisal } from "@/server-actions/grpc/appraisalNew";
import { ResultThrow, newSameOrNew, sameOrNewValue } from "@/components/todo";
import { PasteForm } from "../Paste";
import { useBrowserContext } from "@/browser/context";
import { Record } from "./ItemRecord";
import { Cart, CartInfo } from "./Cart";
import { InventoryTable } from "./InventoryTable";
import { Footer } from "./InventoryFooter";
import { clientGetShopParseText } from "@/browser/shopparsetext";
import { ShopAppraisalContainerProps } from "../ShopAppraisalContainer";
import { BasePurchaseContainerProps } from "./Container";
import { SelectOption } from "@/components/Input/Manipulator";
import { ConfirmParse } from "./ConfirmParse";

const setCartQuantity = (
  record: Record,
  cartInfo: CartInfo,
  newQuantity: number | null
): void => {
  const oldQuantity = record.cartQuantity ?? 0;
  const quantityDiff = (newQuantity ?? 0) - oldQuantity;

  // update cart info
  cartInfo.quantity += quantityDiff;
  if (cartInfo.quantity === 0) {
    cartInfo.price = 0;
  } else {
    cartInfo.price += quantityDiff * record.pricePerUnit;
  }

  // update record
  record.cartQuantity = newQuantity;
};

export interface ShopInventoryProps
  extends Omit<ShopAppraisalContainerProps, "containerChildren">,
    Omit<BasePurchaseContainerProps, "character"> {
  onCheckout: (items: BasicItem[]) => void;
}
export const ShopInventory = ({
  typeNamingLists,
  items,
  locationId,
  onCheckout,
  options,
  defaultOption,
}: ShopInventoryProps): ReactElement => {
  const [territory, setTerritory] = useState<SelectOption<string> | null>(
    defaultOption ?? null
  );
  const [text, setText] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ShopAppraisal | null>(null);
  const [viewingCart, setViewingCart] = useState(false);
  const [cartInfo, setCartInfo] = useState<CartInfo>({ price: 0, quantity: 0 });
  const [records, setRecords] = useState<Record[]>(() =>
    items.map((item, i) => new Record(item, i, typeNamingLists))
  );
  const ctx = useBrowserContext();

  const locationIdStr = locationId.toString();

  const recordsMap: Map<number, Record> = useMemo(
    () =>
      new Map(
        (function* () {
          for (const record of records) {
            yield [record.typeId, record];
          }
        })()
      ),
    [records]
  );

  const actionParseAdd = useCallback(
    async (text: string) => {
      const newParsed = await resultParseAsAppraisal(text).then((result) =>
        ResultThrow(result)
      );
      mutateParsedWithInventory(newParsed, recordsMap, cartInfo.price);
      setParsed(newParsed);
    },
    [recordsMap, cartInfo.price]
  );

  useEffect(() => {
    if (ctx === null) return;
    const savedText = clientGetShopParseText(ctx, locationIdStr, true);
    if (savedText !== null) {
      setText(savedText);
      actionParseAdd(savedText);
    }
  }, [ctx, locationIdStr, actionParseAdd]);

  const tableSetCartQuantity = useCallback(
    (index: number, quantity: number | null): void => {
      const record = records[index];
      setCartQuantity(record, cartInfo, quantity);
      setCartInfo({ ...cartInfo });
      setRecords([...records]);
    },
    [records, cartInfo]
  );

  const parseSetCartQuantity = useCallback(
    (parsed: ShopAppraisal): void => {
      for (const item of parsed?.items ?? []) {
        if (item.unknown) continue;
        const record = recordsMap.get(item.typeId);
        if (record === undefined) continue;
        const newQuantity =
          record.cartQuantity ??
          0 + sameOrNewValue(item.quantity, item.contractQuantity);
        setCartQuantity(record, cartInfo, newQuantity);
      }
      setCartInfo({ ...cartInfo });
      setRecords([...records]);
      setParsed(null);
    },
    [records, cartInfo, recordsMap]
  );

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
        {parsed && (
          <ConfirmParse
            parsed={parsed}
            onConfirm={parseSetCartQuantity}
            onCancel={() => setParsed(null)}
          />
        )}
        {viewingCart && (
          <Cart
            records={records}
            price={cartInfo.price}
            onCheckout={onCheckout}
            onCancel={() => setViewingCart(false)}
          />
        )}
        <PasteForm
          className={classNames("w-[28rem]", "pt-2", "ml-auto", "mr-auto")}
          text={text}
          setText={setText}
          territory={territory}
          setTerritory={setTerritory}
          options={options}
          territoryTitle={"Location"}
          submitTitle={territory?.value === locationIdStr ? "Add" : "Shop"}
          pasteTitle={"(OPTIONAL) Paste Items"}
          action={actionParseAdd}
        />
        <div className={classNames("w-full", "p-2")}>
          <InventoryTable
            records={records}
            setCartQuantity={tableSetCartQuantity}
          />
        </div>
      </ErrorBoundaryTryAgain>
    </ContentBookend>
  );
};

const BasisDiv = ({ children }: PropsWithChildren): ReactElement => (
  <div
    className={classNames(
      "basis-0",
      "flex-grow",
      "flex",
      "items-center",
      "justify-center"
    )}
  >
    {children}
  </div>
);

const mutateParsedWithInventory = (
  parsed: ShopAppraisal,
  inventory: Map<number, Record>,
  currentPrice: number
): void => {
  [parsed.price, parsed.newPrice] = [currentPrice, currentPrice];
  for (const item of parsed.items) {
    if (item.unknown) {
      continue;
    }
    const record = inventory.get(item.typeId);
    if (!record) {
      item.description = "Not Found";
      continue;
    }
    item.pricePerUnit = record?.pricePerUnit ?? 0;
    item.description = record?.description ?? "";
    const purchaseable = Math.min(item.quantity, record.availableQuantity);
    item.contractQuantity = newSameOrNew(item.quantity, purchaseable);
    parsed.newPrice += item.pricePerUnit * purchaseable;
  }
  parsed.newPrice = newSameOrNew(parsed.price, parsed.newPrice);
};
