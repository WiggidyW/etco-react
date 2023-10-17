"use client";

import { AppraisalItem } from "@/server-actions/grpc/appraisal";
import { CopyClipboard } from "@/components/SVG";
import { ReactElement } from "react";
import classNames from "classnames";

export interface CopyButtonProps {
  className?: string;
  svgClassName?: string;
  items: AppraisalItem[];
}
export const CopyButton = ({
  className,
  svgClassName,
  items,
}: CopyButtonProps): ReactElement => {
  return (
    <button
      onClick={() => copy(items)}
      className={classNames("bg-transparent", "block", className)}
    >
      <CopyClipboard
        fill="currentColor"
        className={classNames("w-5", "h-5", svgClassName)}
      />
    </button>
  );
};

const copy = (items: AppraisalItem[]): void => {
  let itemsString = "";
  for (const item of items) {
    if (item.typeId > 0 && !item.unknown && item.quantity > 0) {
      itemsString += `${item.name}\t${item.quantity}\n`;
    }
  }
  navigator.clipboard.writeText(itemsString);
};
