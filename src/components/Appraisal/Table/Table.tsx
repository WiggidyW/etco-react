"use client";

import { ReactElement } from "react";
import classNames from "classnames";
import {
  AppraisalDiffInfoTable,
  AppraisalDiffInfoTableProps,
} from "./DiffInfo";
import { AppraisalItemsTable, AppraisalItemsTableProps } from "./Items";
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

export interface BaseAppraisalTableProps {
  className?: string;
  appraisal: AppraisalTablePartialAppraisal;
}

export type AppraisalTableProps = BaseAppraisalTableProps &
  AppraisalDiffInfoTableProps &
  AppraisalItemsTableProps;
export const AppraisalTable = ({
  className,
  priceHeadVals,
  time,
  timeHeadVals,
  version,
  versionHeadVals,
  appraisalQuantityHeadVals,
  contractQuantityHeadVals,
  descriptionHeadVals,
  pricePerHeadVals,
  priceTotalHeadVals,
  ...sharedChildTableProps
}: AppraisalTableProps): ReactElement => (
  <div className={classNames("flex", "flex-col", "min-w-min", className)}>
    <AppraisalDiffInfoTable
      {...sharedChildTableProps}
      priceHeadVals={priceHeadVals}
      time={time}
      timeHeadVals={timeHeadVals}
      version={version}
      versionHeadVals={versionHeadVals}
    />
    <AppraisalItemsTable
      {...sharedChildTableProps}
      appraisalQuantityHeadVals={appraisalQuantityHeadVals}
      contractQuantityHeadVals={contractQuantityHeadVals}
      descriptionHeadVals={descriptionHeadVals}
      pricePerHeadVals={pricePerHeadVals}
      priceTotalHeadVals={priceTotalHeadVals}
    />
  </div>
);
