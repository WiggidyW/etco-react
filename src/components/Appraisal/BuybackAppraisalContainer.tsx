"use client";

import { resultParseNewBuybackAppraisal } from "@/server-actions/grpc/appraisalNew";
import { useAppraisalCodeURIEffect } from "./useAppraisalCode";
import { ReactElement, useCallback, useState } from "react";
import { SelectOption } from "../Input/Manipulator";
import { AppraisalContainer } from "./Container";
import { ICharacter } from "@/browser/character";
import { PasteForm, PasteFormProps } from "./Paste";
import { ResultThrow } from "../todo";
import classNames from "classnames";
import {
  AppraisalContainerChildren,
  newAppraisalContainerChildren,
} from "./ContainerChildren";

export interface BuybackAppraisalContainerProps {
  character?: ICharacter;
  containerChildren?: AppraisalContainerChildren;
  options: { label: string; value: string }[];
  defaultOption?: { label: string; value: string };
}
export const BuybackAppraisalContainer = ({
  character,
  containerChildren: serverContainerChildren,
  options,
  defaultOption,
}: BuybackAppraisalContainerProps): ReactElement => {
  const [territory, setTerritory] = useState<SelectOption<string> | null>(
    defaultOption ?? null
  );
  const [text, setText] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [containerChildren, setContainerChildren] = useState<
    AppraisalContainerChildren | undefined
  >(serverContainerChildren);

  useAppraisalCodeURIEffect("/buyback", code);

  const actionParseNewAppraisal = useCallback(
    async (text: string, systemId: number) => {
      // This is the only place where we use a server action without the "useServerAction" hook.
      const appraisal = await resultParseNewBuybackAppraisal(
        systemId,
        text,
        character
      ).then((result) => ResultThrow(result));
      setCode(appraisal.code);
      setContainerChildren(newAppraisalContainerChildren(appraisal));
    },
    [character]
  );

  const pasteFormProps: Omit<PasteFormProps, "className"> = {
    text,
    setText,
    territory,
    setTerritory,
    options,
    textRequired: true,
    territoryTitle: "System",
    submitTitle: "Appraise",
    pasteTitle: "Paste Items",
    action: actionParseNewAppraisal,
  };

  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <PasteForm
          {...pasteFormProps}
          className={classNames(
            "min-w-[24rem]",
            "w-[30%]",
            "ml-auto",
            "mr-auto"
          )}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <PasteForm
          {...pasteFormProps}
          className={classNames("w-96", "justify-self-start")}
        />
      </AppraisalContainer>
    );
  }
};
