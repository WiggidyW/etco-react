import { LocationSelect } from "./LocationSelect";
import { AppraisalContainer } from "./Container";
import { ReactElement } from "react";
import classNames from "classnames";
import { AppraisalContainerChildren } from "./ContainerChildren";

export interface ShopAppraisalContainerProps {
  options: { label: string; value: string }[];
  containerChildren?: AppraisalContainerChildren;
}
export const ShopAppraisalContainer = ({
  containerChildren,
  options,
}: ShopAppraisalContainerProps): ReactElement => {
  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <LocationSelect
          className={classNames("ml-auto", "mr-auto")}
          options={options}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <LocationSelect
          className={classNames("w-96", "justify-self-start")}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
