import { LocationSelect } from "./LocationSelect";
import { AppraisalContainer } from "./Container";
import { ReactElement } from "react";
import classNames from "classnames";
import { AppraisalContainerChildren } from "./ContainerChildren";

export interface ShopAppraisalContainerProps {
  options: { label: string; value: string }[];
  basePath: string;
  containerChildren?: AppraisalContainerChildren;
}
export const ShopAppraisalContainer = ({
  basePath,
  containerChildren,
  options,
}: ShopAppraisalContainerProps): ReactElement => {
  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <LocationSelect
          className={classNames("ml-auto", "mr-auto")}
          basePath={basePath}
          options={options}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <LocationSelect
          className={classNames("w-96", "justify-self-start")}
          basePath={basePath}
          options={options}
        />
      </AppraisalContainer>
    );
  }
};
