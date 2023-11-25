"use client";

import { AppraisalContainer } from "./Container";
import { ReactElement, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { AppraisalContainerChildren } from "./ContainerChildren";
import { SelectOption } from "../Input/Manipulator";
import { PasteLink, PasteLinkProps } from "./Paste";
import { usePathname } from "next/navigation";
import { useBrowserContext } from "@/browser/context";
import { clientSetShopParseText } from "@/browser/shopparsetext";

export interface ShopAppraisalContainerProps {
  containerChildren?: AppraisalContainerChildren;
  options: { label: string; value: string }[];
  defaultOption?: { label: string; value: string };
}
export const ShopAppraisalContainer = ({
  containerChildren,
  options,
  defaultOption,
}: ShopAppraisalContainerProps): ReactElement => {
  const [territory, setTerritory] = useState<SelectOption<string> | null>(
    defaultOption ?? null
  );
  const [text, setText] = useState<string | null>(null);
  const ctx = useBrowserContext();
  const pathName = usePathname();

  const setShopParseText = useCallback(
    () =>
      ctx && territory && clientSetShopParseText(ctx, territory.value, text),
    [ctx, text, territory]
  );

  useEffect(() => {
    if (ctx === null) return;
    window.addEventListener("blur", setShopParseText);
    return () => window.removeEventListener("blur", setShopParseText);
  }, [ctx, setShopParseText]);

  const pasteLinkProps: Omit<PasteLinkProps, "className"> = {
    text,
    setText,
    territory,
    setTerritory,
    options,
    textRequired: false,
    territoryTitle: "Location",
    submitTitle: "Shop",
    pasteTitle: "(OPTIONAL) Paste Items",
    linkProps: {
      href: territory ? `/shop/inventory/${territory.value}` : pathName,
      onClick: setShopParseText,
      onContextMenu: setShopParseText,
    },
    intrinsicTextAreaProps: {
      onBlur: setShopParseText,
    },
  };

  if (containerChildren === undefined) {
    return (
      <>
        <div className={classNames("h-[5%]")} />
        <div className={classNames("flex", "flex-col", "justify-center")}>
          <span className={classNames("ml-auto", "mr-auto")}>
            {
              "1. (Optional) Paste Items you wish to purchase into the paste-box."
            }
          </span>
          <br />
          <span className={classNames("ml-auto", "mr-auto")}>
            {"2. Select the location you wish to purchase from."}
          </span>
          <br />
          <span className={classNames("ml-auto", "mr-auto")}>
            {'3. Click the "Shop" button.'}
          </span>
        </div>
        <div className={classNames("h-[5%]")} />
        <PasteLink
          {...pasteLinkProps}
          className={classNames(
            "min-w-[24rem]",
            "w-[30%]",
            "ml-auto",
            "mr-auto"
          )}
        />
      </>
    );
  } else {
    return (
      <AppraisalContainer containerChildren={containerChildren}>
        <PasteLink
          {...pasteLinkProps}
          className={classNames("w-96", "justify-self-start")}
        />
      </AppraisalContainer>
    );
  }
};
