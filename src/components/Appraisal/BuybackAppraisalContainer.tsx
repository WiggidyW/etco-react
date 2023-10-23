"use client";

import { resultParseNewBuybackAppraisal } from "@/server-actions/grpc/appraisalNew";
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
import { ResultThrow } from "../todo";

export interface BuybackAppraisalContainerProps {
  character?: ICharacter;
  containerChildren?: AppraisalContainerChildren;
  options: { label: string; value: string }[];
}
export const BuybackAppraisalContainer = ({
  options,
  character,
  containerChildren: serverContainerChildren,
}: BuybackAppraisalContainerProps): ReactElement => {
  const [containerChildren, setContainerChildren] = useState<
    AppraisalContainerChildren | undefined
  >(serverContainerChildren);
  const [code, setCode] = useState<string | null>(null);
  useAppraisalCodeURIEffect("/buyback", code);

  const actionParseNewAppraisal = async (text: string, systemId: number) => {
    // This is the only place where we use a server action without the "useServerAction" hook.
    const appraisal = await resultParseNewBuybackAppraisal(
      systemId,
      text,
      character
    ).then((result) => ResultThrow(result));
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
          action={actionParseNewAppraisal}
          options={options}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <PasteSubmit
          className={classNames("w-96", "justify-self-start")}
          action={actionParseNewAppraisal}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
