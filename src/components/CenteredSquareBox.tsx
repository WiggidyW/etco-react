import classNames from "classnames";
import { ReactNode } from "react";
import { Scale, SizeUnit } from "./todo";

export interface CenteredSquareBoxProps {
  scale?: Scale;
  minSize?: SizeUnit;
  children?: ReactNode;
}

export const CenteredSquareBox = ({
  scale = "100%",
  minSize,
  children,
}: CenteredSquareBoxProps): ReactNode => {
  const sizeArgs = minSize && [`min-w-[${minSize}]`, `min-h-[${minSize}]`];
  return (
    <div
      className={classNames(
        sizeArgs,
        "inline-block",
        "w-full",
        "h-full",
        "flex",
        "justify-center",
        "items-center"
      )}
    >
      <div
        className={classNames(
          {
            "w-[25%] h-[25%]": scale === "25%",
            "w-[50%] h-[50%]": scale === "50%",
            "w-[75%] h-[75%]": scale === "75%",
            "w-full h-full": scale === "100%",
          },
          sizeArgs,
          "inline-flex",
          "justify-center"
        )}
      >
        <div
          className={classNames(
            sizeArgs,
            "aspect-[1/1]",
            "max-h-full",
            "max-w-full",
            "inline-flex",
            "flex-col",
            "justify-center"
          )}
        >
          <div
            className={classNames(
              "inline-block",
              "aspect-[1/1]",
              "max-h-full",
              "max-w-full"
              // "ease-linear",
              // "rounded-full",
              // "border-2",
              // "border-gray-200",
              // "border-t-blue-500",
              // "animate-spin"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
