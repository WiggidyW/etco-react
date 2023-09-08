"use client";

import { CurrentCharacterManager } from "@/storage/appAuth/character";
import { ReactElement, RefObject, useEffect } from "react";
import { Rect } from "../dims";
import { storageSetPath } from "@/storage/path";
import LoginImage from "@/assets/eve-sso-login-black-large.png";
import {
  AlliancePortrait,
  CharacterPortrait,
  CorporationPortrait,
} from "../Login/EntityPortrait";

export const getNavBar = (
  rect: Rect,
  path: string
): {
  NavBar: () => ReactElement;
  height: number;
} => {
  // TODO
  const currentCharacter = CurrentCharacterManager.getCurrentCharacter();
  const height = rect.height * 0.1;

  storageSetPath(path);

  const NavBar = (): ReactElement => {
    return (
      <div
        className="fixed top-0 left-0 w-full bg-gray-800 text-white flex flex-row items-center justify-center z-50"
        style={{ height }}
      >
        <a href={`${path}/login`}>
          {(() => {
            if (currentCharacter === null) {
              return <img {...LoginImage} alt="Login" />;
            } else {
              return (
                <>
                  <CharacterPortrait
                    queryId={currentCharacter.id}
                    querySize={256}
                    className="w-24 h-24 rounded-full"
                  />
                  <CorporationPortrait
                    queryId={currentCharacter.corporationId}
                    querySize={256}
                    className="w-12 h-12 rounded-full mx-2"
                  />
                  <AlliancePortrait
                    queryId={currentCharacter.allianceId}
                    querySize={256}
                    className="w-12 h-12 rounded-full"
                  />
                </>
              );
            }
          })()}
        </a>
      </div>
    );
  };

  return { NavBar, height };
};

// const NavBar = ({
//   setNavBarHeight,
//   viewportWidth,
//   viewportHeight,
//   path,
// }: NavBarProps): ReactElement => {
//   // TODO
//   const currentCharacter = CurrentCharacterManager.getCurrentCharacter();
//   const height = 100;

//   useEffect(() => {
//     setNavBarHeight(height);
//   }, [height]);

//   return (
//     <div
//       className="fixed top-0 left-0 w-full bg-gray-800 text-white flex flex-row items-center justify-between"
//       style={{ height: `${height}px` }}
//     />
//   );
// };
