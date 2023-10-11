"use client";

import { parseNewBuybackAppraisal } from "@/server-actions/grpc/appraisalNew";
import { ReactElement, useState } from "react";
import { AppraisalContainer } from "./Container";
import { PasteSubmit } from "./PasteSubmit";
import classNames from "classnames";
import {
  AppraisalContainerChildren,
  newAppraisalContainerChildren,
} from "./ContainerChildren";
import { ICharacter } from "@/browser/character";
import { useAppraisalCodeURIEffect } from "./useAppraisalCode";

export interface BuybackAppraisalContainerProps {
  basePath: string;
  character?: ICharacter;
  containerChildren?: AppraisalContainerChildren;
  options: { label: string; value: string }[];
}
export const BuybackAppraisalContainer = ({
  options,
  basePath,
  character,
  containerChildren: serverContainerChildren,
}: BuybackAppraisalContainerProps): ReactElement => {
  const [containerChildren, setContainerChildren] = useState<
    AppraisalContainerChildren | undefined
  >(serverContainerChildren);
  const [code, setCode] = useState<string | null>(null);
  useAppraisalCodeURIEffect(basePath, code);

  const action = async (text: string, systemId: number) => {
    const appraisal = await parseNewBuybackAppraisal(systemId, text, character);
    setCode(appraisal.code);
    setContainerChildren(newAppraisalContainerChildren(appraisal));
  };

  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <PasteSubmit
          className={classNames(
            "min-w-[24rem]",
            "w-[30%]",
            "ml-auto",
            "mr-auto"
          )}
          action={action}
          options={options}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <PasteSubmit
          className={classNames("w-96", "justify-self-start")}
          action={action}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
