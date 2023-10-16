"use client";

import {
  HTMLProps,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useState,
} from "react";
import classNames from "classnames";
import { AppraisalProps } from "../Info/ContractInfo";
import { formatPrice, formatQuantity } from "../Util";
import { SameOrNewContent } from "../SameOrNewContent";
import { ParabolaEnumerate } from "../ParabolaEnumerate";
import {
  AppraisalChildItem,
  AppraisalItem,
  SameOrNew,
} from "@/server-actions/grpc/appraisal";
import { TypeImage } from "@/components/TypeImage";
import { AppraisalTableProps } from "./Table";

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

export const AppraisalItemsTable = ({
  className,
  appraisal: { items: unsortedItems, status },
}: AppraisalTableProps): ReactElement => {
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
  for (const { newPricePerUnit, newDescription } of items) {
    hasNewPrice = hasNewPrice || newPricePerUnit !== true;
    hasNewDescription = hasNewDescription || newDescription !== true;
    if (hasNewPrice && hasNewDescription) break;
  }

  return (
    <table className={classNames(className)}>
      <thead>
        <tr className={classNames("bg-primary-base")}>
          <Cell th />
          <HeadCells
            cellClassName={classNames("text-lg")}
            hasNewQuantity={hasContract ? "contract" : undefined}
            hasNewPrice={hasNewPrice}
            hasNewDescription={hasNewDescription}
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
            hasContract={hasContract}
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
  alignBottom?: boolean;
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
  alignBottom,
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
          "whitespace-nowrap": !wrap,
          "border-primary-base": borderT || borderB,
          "border-t": borderT,
          "border-b": borderB,
          "align-bottom": alignBottom,
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

interface HeadCellsProps {
  hasNewQuantity?: "contract" | "appraisal";
  hasNewPrice?: boolean;
  hasNewDescription?: boolean;
  cellClassName?: string;
}
const HeadCells = ({
  hasNewQuantity,
  hasNewPrice,
  hasNewDescription,
  cellClassName,
}: HeadCellsProps): ReactElement => (
  <>
    <Cell className={cellClassName} pad th wrap alignBottom>
      Item
    </Cell>
    <Cell className={cellClassName} pad th wrap alignBottom>
      Quantity
      {hasNewQuantity && (
        <ParabolaEnumerate
          strs={
            hasNewQuantity === "contract"
              ? ["Appraisal", "Contract"]
              : ["Cached", "Live"] // hasNewQuantity === "appraisal"
          }
        />
      )}
    </Cell>
    <Cell className={cellClassName} pad th wrap alignBottom>
      PricePer
      {hasNewPrice && <ParabolaEnumerate strs={["Cached", "Live"]} />}
    </Cell>
    <Cell className={cellClassName} pad th wrap alignBottom>
      PriceTotal
      {hasNewPrice && <ParabolaEnumerate strs={["Cached", "Live"]} />}
    </Cell>
    <Cell className={cellClassName} pad th wrap alignBottom>
      Description
      {hasNewDescription && <ParabolaEnumerate strs={["Cached", "Live"]} />}
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
    >
      <div className={classNames("flex", "items-center", "w-full")}>
        {!unknown && <TypeImage typeId={typeId} />}
        <h1>{name}</h1>
      </div>
    </Cell>
    <Cell className={cellClassName} pad borderT>
      <SameOrNewContent
        fmt={formatQuantity}
        oldT={quantity}
        newT={newQuantity}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT>
      <SameOrNewContent
        fmt={formatPrice}
        oldT={pricePer}
        newT={newPricePer}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT>
      <SameOrNewContent
        fmt={formatPrice}
        oldT={priceTotal}
        newT={newPriceTotal}
        cmp
        locale
      />
    </Cell>
    <Cell className={cellClassName} pad borderT wrap>
      <SameOrNewContent
        oldT={unknown && description === "" ? "Unknown Item" : description}
        newT={newDescription}
      />
    </Cell>
  </>
);

interface ItemRowProps {
  item: AppraisalItem;
  childrenVisible?: boolean;
  setChildrenVisible: () => void;
  hasContract?: boolean;
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
}: ItemRowProps): ReactElement => {
  const newQuantity = hasContract ? contractQuantity : undefined;
  const priceTotal = pricePerUnit * quantity;
  const newPriceTotal =
    newPricePerUnit === true ? true : newPricePerUnit * quantity;
  const hasChildren = children.length > 0;
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
        <ChildItemRows items={children} parentQuantity={quantity} />
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

interface ChildItemRowsProps {
  items: AppraisalChildItem[];
  parentQuantity: number;
}
const ChildItemRows = ({
  items,
  parentQuantity,
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
          hasNewQuantity={hasNewQuantity ? "appraisal" : undefined}
          hasNewPrice={hasNewPrice}
          hasNewDescription={hasNewDescription}
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
}: DropdownButtonProps): ReactElement => {
  const ClickedIcon = (
    <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    // <path d="M6.81 16.01L12 10.83l5.19 5.18L18.5 14l-6.5-6.5-6.5 6.5 1.81 1.81z" />
  );
  const NotClickedIcon = (
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    // <path d="M6.81 7.99L12 13.17l5.19-5.18L18.5 10l-6.5 6.5-6.5-6.5 1.81-1.81z" />
  );
  return (
    <button onClick={onClick} className={classNames("bg-transparent", "block")}>
      <svg
        className={classNames("w-6", "h-6")}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        {clicked ? ClickedIcon : NotClickedIcon}
      </svg>
    </button>
  );
};
