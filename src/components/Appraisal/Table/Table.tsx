"use client";

import { ReactElement } from "react";
import classNames from "classnames";
import { AppraisalDiffInfoTable } from "./DiffInfo";
import { AppraisalItemsTable } from "./Items";
import { Appraisal } from "@/server-actions/grpc/appraisal";

export type AppraisalTablePartialAppraisal = Omit<
  Appraisal,
  | "code"
  | "locationId"
  | "systemId"
  | "regionId"
  | "locationNamingMaps"
  | "character"
>;

export interface AppraisalTableProps {
  className?: string;
  appraisal: AppraisalTablePartialAppraisal;
}
export const AppraisalTable = ({
  className,
  appraisal,
}: AppraisalTableProps): ReactElement => (
  <div className={classNames("flex", "flex-col", "min-w-min", className)}>
    <AppraisalDiffInfoTable appraisal={appraisal} />
    <AppraisalItemsTable appraisal={appraisal} />
  </div>
);
