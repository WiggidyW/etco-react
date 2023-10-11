import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";

export interface FooterButtonProps extends PropsWithChildren {
  canClick: boolean;
  onClick: () => void;
}
export const FooterButton = ({
  canClick,
  onClick,
  children,
}: FooterButtonProps): ReactElement => (
  <button
    disabled={!canClick}
    onClick={onClick}
    className={classNames(
      "bg-primary-base",
      "hover:bg-primary-active",
      "text-primary-text",
      "font-bold",
      "py-2",
      "px-4",
      "rounded",
      {
        "opacity-50": !canClick,
        "cursor-not-allowed": !canClick,
      }
    )}
  >
    {children}
  </button>
);
