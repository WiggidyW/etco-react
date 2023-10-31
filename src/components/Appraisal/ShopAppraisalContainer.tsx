import { LocationSelect, LocationSelectProps } from "./LocationSelect";
import { AppraisalContainer } from "./Container";
import { ReactElement } from "react";
import classNames from "classnames";
import { AppraisalContainerChildren } from "./ContainerChildren";

export interface ShopAppraisalContainerProps
  extends Omit<LocationSelectProps, "className"> {
  containerChildren?: AppraisalContainerChildren;
}
export const ShopAppraisalContainer = ({
  containerChildren,
  ...locationSelectProps
}: ShopAppraisalContainerProps): ReactElement => {
  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <LocationSelect
          className={classNames("ml-auto", "mr-auto")}
          {...locationSelectProps}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <LocationSelect
          className={classNames("w-96", "justify-self-start")}
          {...locationSelectProps}
        />
      </AppraisalContainer>
    );
  }
};
