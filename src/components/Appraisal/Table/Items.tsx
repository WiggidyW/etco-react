"use client";

import {
  HTMLProps,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useState,
} from "react";
import classNames from "classnames";
import { formatPrice, formatQuantity } from "../Util";
import { SameOrNewContent } from "../SameOrNewContent";
import { ParabolaEnumerate } from "../ParabolaEnumerate";
import {
  AppraisalChildItem,
  AppraisalItem,
} from "@/server-actions/grpc/appraisal";
import { TypeImage } from "@/components/TypeImage";
import { BaseAppraisalTableProps } from "./Table";
import { VectorDown, VectorUp } from "@/components/SVG";
import { SameOrNew, newSameOrNew, sameOrNewValue } from "@/components/todo";

export interface ItemHeadValsProps {
  contractQuantityHeadVals?: [string, string];
  appraisalQuantityHeadVals?: [string, string];
  pricePerHeadVals?: [string, string];
  priceTotalHeadVals?: [string, string];
  descriptionHeadVals?: [string, string];
}

export interface AppraisalItemsTableProps
  extends BaseAppraisalTableProps,
    ItemHeadValsProps {
  forceNewQuantityCheck?: boolean;
  useNewQuantityPrice?: boolean;
}

export const AppraisalItemsTable = ({
  className,
  appraisal: { items: unsortedItems, status },
  forceNewQuantityCheck = false,
  useNewQuantityPrice = false,
  ...headValsProps
}: AppraisalItemsTableProps): ReactElement => {
  const [childrenVisible, setChildrenVisible] = useState<boolean[]>(() =>
    new Array(unsortedItems.length).fill(false)
  );
  const items = useMemo(() => sortItems(unsortedItems), [unsortedItems]);

  const onChildDropdown = (i: number): void => {
    childrenVisible[i] = !childrenVisible[i];
    setChildrenVisible([...childrenVisible]);
  };

  const hasContract = status !== null && status !== "inPurchaseQueue";
  let hasNewPrice = false;
  let hasNewDescription = false;
  let hasNewQuantity = false;
  for (const { newPricePerUnit, newDescription, contractQuantity } of items) {
    hasNewPrice = hasNewPrice || newPricePerUnit !== true;
    hasNewDescription = hasNewDescription || newDescription !== true;
    if (hasContract || forceNewQuantityCheck) {
      hasNewQuantity = hasNewQuantity || contractQuantity !== true;
    }
    if (
      hasNewPrice &&
      hasNewDescription &&
      (hasNewQuantity || (!hasContract && !forceNewQuantityCheck))
    )
      break;
  }

  return (
    <table className={classNames(className)}>
      <thead>
        <tr className={classNames("bg-primary-base")}>
          <Cell th />
          <HeadCells
            cellClassName={classNames("text-lg")}
            hasNewQuantity={hasNewQuantity ? "contract" : undefined}
            hasNewPrice={hasNewPrice}
            hasNewDescription={hasNewDescription}
            useNewQuantityPrice={useNewQuantityPrice}
            {...headValsProps}
          />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <ItemRow
            key={i}
            item={item}
            childrenVisible={childrenVisible[i]}
            setChildrenVisible={() => onChildDropdown(i)}
            hasContract={hasContract || hasNewQuantity}
            useNewQuantityPrice={useNewQuantityPrice}
            {...headValsProps}
          />
        ))}
      </tbody>
    </table>
  );
};

interface CellProps extends PropsWithChildren {
  className?: string;
  pad?: boolean;
  borderT?: boolean;
  borderB?: boolean;
  rowSpan?: number;
  th?: boolean;
  wrap?: boolean;
  align?: "top" | "bottom";
}
const Cell = ({
  children,
  className,
  pad,
  borderT,
  borderB,
  rowSpan,
  th,
  wrap,
  align,
}: CellProps): ReactElement => {
  const InnerCell = ({
    children,
    ...props
  }: PropsWithChildren<HTMLProps<HTMLTableCellElement>>): ReactElement =>
    th ? <th {...props}>{children}</th> : <td {...props}>{children}</td>;
  return (
    <InnerCell
      className={classNames(
        "p-0",
        "text-left",
        {
          "align-top": align === "top",
          "align-bottom": align === "bottom",
          "whitespace-nowrap": !wrap,
          "border-primary-base": borderT || borderB,
          "border-t": borderT,
          "border-b": borderB,
          [classNames("pl-1", "pr-1")]: pad,
        },
        className
      )}
      rowSpan={rowSpan}
    >
      {children}
    </InnerCell>
  );
};

interface HeadCellsProps extends ItemHeadValsProps {
  hasNewQuantity?: "contract" | "appraisal";
  hasNewPrice?: boolean;
  hasNewDescription?: boolean;
  cellClassName?: string;
  useNewQuantityPrice: boolean;
}
const HeadCells = ({
  hasNewQuantity,
  hasNewPrice,
  hasNewDescription,
  cellClassName,
  useNewQuantityPrice,
  contractQuantityHeadVals = ["Appraisal", "Contract"],
  appraisalQuantityHeadVals = ["Cached", "Live"],
  pricePerHeadVals = ["Cached", "Live"],
  priceTotalHeadVals = ["Cached", "Live"],
  descriptionHeadVals = ["Cached", "Live"],
}: HeadCellsProps): ReactElement => (
  <>
    <Cell className={cellClassName} pad th wrap align="bottom">
      Item
    </Cell>
    <Cell className={cellClassName} pad th wrap align="bottom">
      Quantity
      {hasNewQuantity && (
        <ParabolaEnumerate
          strs={
            hasNewQuantity === "contract"
              ? contractQuantityHeadVals
              : appraisalQuantityHeadVals // hasNewQuantity === "appraisal"
          }
        />
      )}
    </Cell>
    <Cell className={cellClassName} pad th wrap align="bottom">
      PricePer
      {hasNewPrice && <ParabolaEnumerate strs={pricePerHeadVals} />}
    </Cell>
    <Cell className={cellClassName} pad th wrap align="bottom">
      PriceTotal
      {hasNewPrice ||
        (useNewQuantityPrice && hasNewQuantity && (
          <ParabolaEnumerate strs={priceTotalHeadVals} />
        ))}
    </Cell>
    <Cell className={cellClassName} pad th wrap align="bottom">
      Description
      {hasNewDescription && <ParabolaEnumerate strs={descriptionHeadVals} />}
    </Cell>
  </>
);

interface ItemCellsProps {
  typeId: number;
  name: string;
  quantity: number;
  newQuantity?: SameOrNew<number>;
  pricePer: number;
  newPricePer?: SameOrNew<number>;
  priceTotal: number;
  newPriceTotal?: SameOrNew<number>;
  description: string;
  newDescription?: SameOrNew<string>;
  unknown?: boolean;
  cellClassName?: string;
}
const ItemCells = ({
  typeId,
  name,
  quantity,
  newQuantity,
  pricePer,
  newPricePer,
  priceTotal,
  newPriceTotal,
  description,
  newDescription,
  unknown,
  cellClassName,
}: ItemCellsProps): ReactElement => (
  <>
    <Cell
      // className={classNames("item-name", "flex", "items-center", "w-max")}
      className={cellClassName}
      pad
      borderT
      wrap
      align="top"
    >
      <div className={classNames("flex", "items-center", "w-full")}>
        {!unknown && <TypeImage typeId={typeId} />}
        <h1>{name}</h1>
      </div>
    </Cell>
    <Cell className={cellClassName} pad borderT align="top">
      <SameOrNewContent
        fmt={formatQuantity}
        oldT={quantity}
        newT={newQuantity}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT align="top">
      <SameOrNewContent
        fmt={formatPrice}
        oldT={pricePer}
        newT={newPricePer}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT align="top">
      <SameOrNewContent
        fmt={formatPrice}
        oldT={priceTotal}
        newT={newPriceTotal}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT wrap align="top">
      <SameOrNewContent
        oldT={unknown && description === "" ? "Unknown Item" : description}
        newT={newDescription}
      />
    </Cell>
  </>
);

interface ItemRowProps extends ItemHeadValsProps {
  item: AppraisalItem;
  childrenVisible?: boolean;
  setChildrenVisible: () => void;
  hasContract?: boolean;
  useNewQuantityPrice: boolean;
}
const ItemRow = ({
  childrenVisible,
  setChildrenVisible,
  item: {
    typeId,
    name,
    pricePerUnit,
    newPricePerUnit,
    description,
    newDescription,
    quantity,
    contractQuantity,
    children,
    unknown,
  },
  hasContract,
  useNewQuantityPrice,
  ...headValsProps
}: ItemRowProps): ReactElement => {
  const newQuantity = hasContract ? contractQuantity : undefined;
  const priceTotal = pricePerUnit * quantity;
  const hasChildren = children.length > 0;

  const newPriceTotalQuantMultiplier = useNewQuantityPrice
    ? sameOrNewValue(quantity, contractQuantity) // use contractQuantity
    : quantity; // only use quantity no matter what (contractQuantity of 0 with no contract)
  const newPriceTotal = newSameOrNew(
    priceTotal,
    sameOrNewValue(pricePerUnit, newPricePerUnit) * newPriceTotalQuantMultiplier
  );

  return (
    <>
      <tr
        className={classNames({
          "bg-success-base": !unknown && pricePerUnit > 0,
          "bg-failure-base": !unknown && pricePerUnit <= 0,
          "bg-primary-faded": unknown,
        })}
      >
        <Cell
          className={classNames("align-top", "w-min", { "pl-1": hasChildren })}
          borderT
          // borderB={hasChildren}
          rowSpan={childrenVisible ? children.length + 2 : undefined}
        >
          <div className="w-min">
            {hasChildren && (
              <DropdownButton
                onClick={setChildrenVisible}
                clicked={childrenVisible}
              />
            )}
          </div>
        </Cell>
        <ItemCells
          typeId={typeId}
          name={name}
          quantity={quantity}
          newQuantity={newQuantity}
          pricePer={pricePerUnit}
          newPricePer={newPricePerUnit}
          priceTotal={priceTotal}
          newPriceTotal={newPriceTotal}
          description={description}
          newDescription={newDescription}
          unknown={unknown}
        />
      </tr>
      {childrenVisible && (
        <ChildItemRows
          {...headValsProps}
          items={children}
          parentQuantity={quantity}
        />
      )}
    </>
  );
};

interface ChildItemRowProps {
  item: AppraisalChildItem;
  parentQuantity: number;
}
const ChildItemRow = ({
  item: {
    typeId,
    name,
    pricePerUnit,
    newPricePerUnit,
    description,
    newDescription,
    quantityPerParent,
    newQuantityPerParent,
  },
  parentQuantity,
}: ChildItemRowProps): ReactElement => {
  const quantity = quantityPerParent * parentQuantity;
  const priceTotal = pricePerUnit * quantity;

  const newQuantity =
    newQuantityPerParent === true
      ? true
      : newQuantityPerParent * parentQuantity;

  let newPriceTotal: SameOrNew<number>;
  if (newPricePerUnit === true && newQuantity === true) {
    newPriceTotal = true;
  } else if (newPricePerUnit === true) {
    newPriceTotal = pricePerUnit * (newQuantity as number);
  } else if (newQuantity === true) {
    newPriceTotal = newPricePerUnit * quantity;
  } else {
    newPriceTotal = newPricePerUnit * newQuantity;
  }

  return (
    <tr
      className={classNames({
        "bg-success-dark": pricePerUnit > 0,
        "bg-failure-dark": pricePerUnit <= 0,
      })}
    >
      <ItemCells
        typeId={typeId}
        name={name}
        quantity={quantity}
        newQuantity={newQuantity}
        pricePer={pricePerUnit}
        newPricePer={newPricePerUnit}
        priceTotal={priceTotal}
        newPriceTotal={newPriceTotal}
        description={description}
        newDescription={newDescription}
      />
    </tr>
  );
};

interface ChildItemRowsProps extends ItemHeadValsProps {
  items: AppraisalChildItem[];
  parentQuantity: number;
}
const ChildItemRows = ({
  items,
  parentQuantity,
  ...headValsProps
}: ChildItemRowsProps): ReactElement => {
  let hasNewPrice = false;
  let hasNewDescription = false;
  let hasNewQuantity = false;
  for (const {
    newPricePerUnit,
    newDescription,
    newQuantityPerParent,
  } of items) {
    hasNewPrice = hasNewPrice || newPricePerUnit !== true;
    hasNewDescription = hasNewDescription || newDescription !== true;
    hasNewQuantity = hasNewQuantity || newQuantityPerParent !== true;
    if (hasNewPrice && hasNewDescription && hasNewQuantity) break;
  }

  return (
    <>
      <tr className={classNames("bg-primary-base")}>
        <HeadCells
          {...headValsProps}
          hasNewQuantity={hasNewQuantity ? "appraisal" : undefined}
          hasNewPrice={hasNewPrice}
          hasNewDescription={hasNewDescription}
          useNewQuantityPrice
        />
      </tr>
      {items.map((item, i) => (
        <ChildItemRow key={i} item={item} parentQuantity={parentQuantity} />
      ))}
    </>
  );
};

interface DropdownButtonProps {
  clicked?: boolean;
  onClick: () => void;
}
const DropdownButton = ({
  clicked,
  onClick,
}: DropdownButtonProps): ReactElement => (
  <button onClick={onClick} className={classNames("bg-transparent", "block")}>
    {clicked ? (
      <VectorUp fill="currentColor" className={classNames("w-6", "h-6")} />
    ) : (
      <VectorDown fill="currentColor" className={classNames("w-6", "h-6")} />
    )}
  </button>
);

const sortItems = (items: AppraisalItem[]): AppraisalItem[] =>
  items.sort((a, b) => {
    if (a.pricePerUnit === 0 && b.pricePerUnit === 0) {
      if (a.unknown && !b.unknown) {
        return 1;
      } else if (!a.unknown && b.unknown) {
        return -1;
      } else {
        return a.name.localeCompare(b.name);
      }
    } else {
      return b.pricePerUnit * b.quantity - a.pricePerUnit * a.quantity;
    }
  });
