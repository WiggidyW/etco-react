import { PropsWithChildren, ReactElement, ReactNode } from "react";
import classNames from "classnames";
import { formatPrice, formatTime } from "../Util";
import { SameOrNewContent, SameOrNewContentProps } from "../SameOrNewContent";
import { ParabolaEnumerate } from "../ParabolaEnumerate";
import { BaseAppraisalTableProps } from "./Table";
import { CopyButton } from "./CopyButton";

export interface AppraisalDiffInfoTableProps extends BaseAppraisalTableProps {
  priceHeadVals?: [string, string];
  time?: boolean;
  timeHeadVals?: [string, string];
  version?: boolean;
  versionHeadVals?: [string, string];
}
export const AppraisalDiffInfoTable = ({
  className,
  appraisal: {
    price,
    newPrice,
    time: appraisalTime,
    newTime,
    version: appraisalVersion,
    newVersion,
    items,
  },
  priceHeadVals = ["Cached", "Live"],
  timeHeadVals = ["Cached", "Live"],
  versionHeadVals = ["Cached", "Live"],
  time = true,
  version = true,
}: AppraisalDiffInfoTableProps): ReactElement => (
  <div className={classNames("flex", "flex-wrap", className)}>
    <AppraisalDiffInfoTablePair
      headVals={priceHeadVals}
      tdClassName="text-xl"
      oldT={price}
      newT={newPrice}
      fmt={formatPrice}
      flexWrapped
      locale
      cmp
      startChildren={
        <CopyButton
          svgClassName={classNames("mr-auto")}
          className={classNames(
            "flex-grow",
            "basis-0",
            "self-start",
            "m-1",
            "mb-0"
          )}
          items={items}
        />
      }
      endChildren={<span className={classNames("flex-grow", "basis-0")} />}
    >
      Price
    </AppraisalDiffInfoTablePair>
    {time && (
      <AppraisalDiffInfoTablePair
        headVals={timeHeadVals}
        oldT={appraisalTime}
        newT={newTime}
        fmt={formatTime}
        locale
        flexWrapped
      >
        Time
      </AppraisalDiffInfoTablePair>
    )}
    {version && (
      <AppraisalDiffInfoTablePair
        headVals={versionHeadVals}
        oldT={appraisalVersion}
        newT={newVersion}
        flexWrapped
      >
        Version
      </AppraisalDiffInfoTablePair>
    )}
  </div>
);

interface AppraisalDiffInfoTablePairProps
  extends SameOrNewContentProps,
    PropsWithChildren {
  headVals: string[];
  tdClassName?: string;
  className?: string;
  flexWrapped?: boolean;
  startChildren?: ReactNode;
  endChildren?: ReactNode;
}
const AppraisalDiffInfoTablePair = ({
  children,
  endChildren,
  startChildren,
  headVals,
  tdClassName = "text-sm",
  className,
  newT,
  flexWrapped,
  ...SameOrNewContentProps
}: AppraisalDiffInfoTablePairProps): ReactElement => (
  <div
    className={classNames(
      "flex",
      // "w-full",
      "items-center",
      "justify-center",
      "mb-px",
      "bg-primary-base",
      {
        [classNames("flex-grow", "basis-0")]: flexWrapped,
        "w-full": !flexWrapped,
      },
      className
    )}
  >
    {startChildren}
    <table className={classNames("diff-info-table-pair", "whitespace-nowrap")}>
      <tbody>
        <tr>
          <th
            className={classNames("text-base", "text-right", "text-lg", {
              "pr-3": newT === true,
            })}
          >
            {children}
            {newT !== true && (
              <ParabolaEnumerate strs={headVals} hClassName="text-xs" />
            )}
          </th>
          <td className={classNames("text-left", tdClassName)}>
            <SameOrNewContent newT={newT} {...SameOrNewContentProps} />
          </td>
        </tr>
      </tbody>
    </table>
    {endChildren}
  </div>
);
