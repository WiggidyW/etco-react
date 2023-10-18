import { LocationSelect } from "./LocationSelect";
import { AppraisalContainer } from "./Container";
import { ReactElement } from "react";
import classNames from "classnames";
import { AppraisalContainerChildren } from "./ContainerChildren";
import { ICharacter } from "@/browser/character";

export interface ShopAppraisalContainerProps {
  options: { label: string; value: string }[];
  containerChildren?: AppraisalContainerChildren;
  character: ICharacter | null | undefined;
}
export const ShopAppraisalContainer = ({
  containerChildren,
  options,
  character,
}: ShopAppraisalContainerProps): ReactElement => {
  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <LocationSelect
          character={character}
          className={classNames("ml-auto", "mr-auto")}
          options={options}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <LocationSelect
          character={character}
          className={classNames("w-96", "justify-self-start")}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
