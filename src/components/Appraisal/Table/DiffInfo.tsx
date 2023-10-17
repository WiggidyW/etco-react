import { PropsWithChildren, ReactElement, ReactNode } from "react";
import classNames from "classnames";
import { formatPrice, formatTime } from "../Util";
import { SameOrNewContent, SameOrNewContentProps } from "../SameOrNewContent";
import { ParabolaEnumerate } from "../ParabolaEnumerate";
import { AppraisalTableProps } from "./Table";
import { CopyButton } from "./CopyButton";

export const AppraisalDiffInfoTable = ({
  className,
  appraisal: { price, newPrice, time, newTime, version, newVersion, items },
}: AppraisalTableProps): ReactElement => (
  <div
    className={classNames("diff-info-table", "flex", "flex-wrap", className)}
  >
    <AppraisalDiffInfoTablePair
      headVals={["Cached", "Live"]}
      oldT={time}
      newT={newTime}
      fmt={formatTime}
      locale
      flexWrapped
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
      Time
    </AppraisalDiffInfoTablePair>
    <AppraisalDiffInfoTablePair
      headVals={["Cached", "Live"]}
      oldT={version}
      newT={newVersion}
      flexWrapped
    >
      Version
    </AppraisalDiffInfoTablePair>
    <AppraisalDiffInfoTablePair
      headVals={["Cached", "Live"]}
      tdClassName="text-xl"
      oldT={price}
      newT={newPrice}
      fmt={formatPrice}
      locale
      cmp
    >
      Price
    </AppraisalDiffInfoTablePair>
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
