import { ReactElement } from "react";
import classNames from "classnames";
import { CenteredSquareBox } from "./CenteredSquareBox";
import { Scale } from "./todo";

export interface LoadingProps {
  scale?: Scale;
}

export const Loading = ({ scale = "100%" }: LoadingProps): ReactElement => (
  <CenteredSquareBox scale={scale} minSize={"4px"}>
    <div
      className={classNames(
        // "aspect-[1/1]",
        "h-full",
        "w-full",
        "ease-linear",
        "rounded-full",
        "border-2",
        "border-gray-200",
        "border-t-blue-500",
        "animate-spin"
      )}
    />
  </CenteredSquareBox>
);
