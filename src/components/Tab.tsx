"use client";

import classNames from "classnames";
import { PropsWithChildren } from "react";

export interface TabProps extends PropsWithChildren {
  styleClassName?: string;
  className?: string;
  connect: "top" | "bottom";
  // style?: "default" | "active";
  active?: boolean;
  onClick: () => void;
}
export const Tab = ({
  styleClassName = classNames("border-primary-border", "bg-primary-base"),
  className,
  connect,
  active,
  onClick,
  children,
}: TabProps): React.ReactElement => (
  <div
    className={classNames(
      "cursor-pointer",
      "px-4",
      "font-medium",
      "border-l",
      "border-r",
      "transition",
      {
        [classNames(
          "border-t",
          "rounded-tl-lg",
          "rounded-tr-lg",
          "pt-2",
          "pb-1"
        )]: connect === "bottom",
        [classNames(
          "border-b",
          "rounded-bl-lg",
          "rounded-br-lg",
          "pt-1",
          "pb-2"
        )]: connect === "top",
        [classNames("brightness-150", "cursor-default")]: active,
        "hover:brightness-150": !active,
      },
      className,
      styleClassName
    )}
    onClick={onClick}
  >
    {children}
  </div>
);
