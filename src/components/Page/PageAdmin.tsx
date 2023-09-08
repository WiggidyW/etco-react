"use client";

import { Character } from "@/storage/character";
import { ReactElement } from "react";
import { PageMain, PageMainProps } from "./PageMain";
import { Popup } from "../Popup";
import { CurrentCharacterManager } from "@/storage/appAuth/character";
import { Rect } from "../dims";

export interface CurrentCharacterProps {
  currentCharacter: Character;
}

export interface PageAdminProps extends Omit<PageMainProps, "children"> {
  children?: (args: Rect & CurrentCharacterProps) => ReactElement;
}

// TODO: DRY
export const PageAdmin = ({ path, children }: PageAdminProps): ReactElement => {
  const currentCharacter = CurrentCharacterManager.getCurrentCharacter();

  if (currentCharacter === null) {
    return (
      <PageMain path={path}>
        {(fwdprops) => (
          <Popup
            contentRect={fwdprops}
            title="Login"
            message="Please login to continue."
          />
        )}
      </PageMain>
    );
  } else if (!currentCharacter.admin) {
    return (
      <PageMain path={path}>
        {(fwdprops) => (
          <Popup
            contentRect={fwdprops}
            title="Not Admin"
            message="You are not logged in as an admin. If you believe this is incorrect, please log out and log back in."
          />
        )}
      </PageMain>
    );
  } else {
    return (
      <PageMain path={path}>
        {(rect) => children && children({ ...rect, currentCharacter })}
      </PageMain>
    );
  }
};
