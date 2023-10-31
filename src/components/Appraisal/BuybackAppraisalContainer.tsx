"use client";

import { resultParseNewBuybackAppraisal } from "@/server-actions/grpc/appraisalNew";
import { ReactElement, useCallback, useState } from "react";
import { AppraisalContainer } from "./Container";
import { PasteSubmit } from "./Paste";
import classNames from "classnames";
import {
  AppraisalContainerChildren,
  newAppraisalContainerChildren,
} from "./ContainerChildren";
import { ICharacter } from "@/browser/character";
import { useAppraisalCodeURIEffect } from "./useAppraisalCode";
import { ResultThrow } from "../todo";
import { SelectOption } from "../Input/Manipulator";

export interface BuybackAppraisalContainerProps {
  character?: ICharacter;
  containerChildren?: AppraisalContainerChildren;
  options: { label: string; value: string }[];
  defaultOption?: { label: string; value: string };
}
export const BuybackAppraisalContainer = ({
  options,
  character,
  defaultOption,
  containerChildren: serverContainerChildren,
}: BuybackAppraisalContainerProps): ReactElement => {
  const [system, setSystem] = useState<SelectOption<string> | null>(
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

  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <PasteSubmit
          system={system}
          setSystem={setSystem}
          text={text}
          setText={setText}
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
          system={system}
          setSystem={setSystem}
          text={text}
          setText={setText}
          className={classNames("w-96", "justify-self-start")}
          action={actionParseNewAppraisal}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
