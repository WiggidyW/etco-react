import { Appraisal } from "@/server-actions/grpc/appraisal";
import { AppraisalContractInfo } from "./Info/ContractInfo";
import { AppraisalPrimaryInfo } from "./Info/PrimaryInfo";
import { AppraisalTable } from "./Table/Table";
import { ReactNode } from "react";
import { ICharacter } from "@/browser/character";

export interface AppraisalContainerChildren {
  primaryInfo: ReactNode;
  contractInfo: ReactNode;
  table: ReactNode;
}

export const newAppraisalContainerChildren = (
  appraisal: Appraisal,
  character?: ICharacter
): AppraisalContainerChildren => ({
  primaryInfo: (
    <AppraisalPrimaryInfo appraisal={appraisal} character={character} />
  ),
  contractInfo: <AppraisalContractInfo appraisal={appraisal} />,
  table: <AppraisalTable appraisal={appraisal} />,
});
