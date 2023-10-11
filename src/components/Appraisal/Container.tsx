import { AppraisalContainerChildren } from "./ContainerChildren";
import { PropsWithChildren, ReactElement } from "react";
import classNames from "classnames";

export interface AppraisalContainerProps extends PropsWithChildren {
  containerChildren: AppraisalContainerChildren; // can be either server or client rendered
}
export const AppraisalContainer = ({
  containerChildren: { primaryInfo, contractInfo, table },
  children,
}: AppraisalContainerProps): ReactElement => (
  <div className={classNames("min-w-min", "p-2")}>
    <div
      className={classNames(
        "flex",
        "justify-between",
        "flex-wrap",
        "space-x-4",
        "space-y-4",
        "pb-4"
      )}
    >
      <BasisDiv>{children}</BasisDiv>
      <BasisDiv>{primaryInfo}</BasisDiv>
      <BasisDiv>{contractInfo}</BasisDiv>
    </div>
    {table}
  </div>
);

const BasisDiv = ({ children }: PropsWithChildren): ReactElement => (
  <div
    className={classNames(
      "basis-0",
      "flex-grow",
      "flex",
      "items-center",
      "justify-center"
    )}
  >
    {children}
  </div>
);
