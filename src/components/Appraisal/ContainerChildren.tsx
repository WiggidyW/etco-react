import { Appraisal } from "@/server-actions/grpc/appraisal";
import { AppraisalContractInfo } from "./Info/ContractInfo";
import { AppraisalPrimaryInfo } from "./Info/PrimaryInfo";
import { AppraisalTable } from "./Table/Table";
import { ReactNode } from "react";

export interface AppraisalContainerChildrenProps {
  appraisal: Appraisal;
}

export interface AppraisalContainerChildren {
  primaryInfo: ReactNode;
  contractInfo: ReactNode;
  table: ReactNode;
}

export const newAppraisalContainerChildren = (
  appraisal: Appraisal
): AppraisalContainerChildren => ({
  primaryInfo: <AppraisalPrimaryInfo appraisal={appraisal} />,
  contractInfo: <AppraisalContractInfo appraisal={appraisal} />,
  table: <AppraisalTable appraisal={appraisal} />,
});
