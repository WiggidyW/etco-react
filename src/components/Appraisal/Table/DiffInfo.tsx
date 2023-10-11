import { PropsWithChildren, ReactElement } from "react";
import classNames from "classnames";
import { formatPrice, formatTime } from "../Util";
import { SameOrNewContent, SameOrNewContentProps } from "../SameOrNewContent";
import { ParabolaEnumerate } from "../ParabolaEnumerate";
import { SameOrNew } from "@/server-actions/grpc/appraisal";
import { AppraisalTableProps } from "./Table";

export const AppraisalDiffInfoTable = ({
  className,
  appraisal: { price, newPrice, time, newTime, version, newVersion },
}: AppraisalTableProps): ReactElement => (
  <div
    className={classNames(
      "diff-info-table",
      "flex",
      "flex-wrap",
      // "border-b",
      // "mb-px",
      // "border-primary-border",
      className
    )}
  >
    <AppraisalDiffInfoTablePair
      headVals={["Cached", "Live"]}
      oldT={time}
      newT={newTime}
      fmt={formatTime}
      locale
      flexWrapped
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
}
const AppraisalDiffInfoTablePair = ({
  children,
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
  </div>
);
