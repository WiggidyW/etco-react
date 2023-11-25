"use client";

import {
  ReactElement,
  ReactNode,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Character } from "@/browser/character";
import { MutableCharacters, ReadonlyCharacters } from "@/browser/characters";
import classNames from "classnames";
import { LoginCharacterPortrait } from "./Portrait";
import { BrowserContextMarker, useBrowserContext } from "@/browser/context";
import {
  storageGetMutableCharacters,
  storageGetReadonlyCharacters,
  storageSetCharacters,
} from "@/browser/storage";
import { clientCookiesSetLoginCallbackRedirect } from "@/cookies/client";
import { iterIndexed } from "../todo";
import { Tab } from "../Tab";
import {
  serverCookiesDelCurrentCharacter,
  serverCookiesSetCurrentCharacter,
} from "@/cookies/server";

export interface CharacterSelectionProps {
  charactersKey: string;
  onSelect: (character: Character) => void;
}

export const CharacterSelection = ({
  charactersKey,
  onSelect: onSelectProp,
}: CharacterSelectionProps): ReactElement => {
  const browserCtx = useBrowserContext();
  const forbidSelect = useRef<boolean>(false);
  const [readonlyCharacters, setReadonlyCharacters] =
    useState<ReadonlyCharacters>(() =>
      loadReadonlyCharactersOrDefault(browserCtx, charactersKey)
    );

  useEffect(() => {
    if (browserCtx !== null && readonlyCharacters.length === 0) {
      setReadonlyCharacters(
        loadReadonlyCharactersOrDefault(browserCtx, charactersKey)
      );
    }
  }, [browserCtx]);

  const onSelect = (e: ReactMouseEvent, character: Character): void => {
    if (forbidSelect.current) return e.preventDefault();
    console.log("select " + character.name);
    onSelectProp(character);
  };

  return (
    <SelectionContainer
      key={readonlyCharacters.length}
      setForbidSelect={(b: boolean) => (forbidSelect.current = b)}
    >
      {Array.from(
        (function* () {
          for (const character of readonlyCharacters) {
            yield (
              <LoginCharacterPortrait
                key={character.id}
                size={"auto"}
                character={character}
                onClickOrLink={{
                  kind: "onClick",
                  onClick: (e) => onSelect(e, character),
                }}
                nameBar={false}
              />
            );
          }
        })()
      )}
    </SelectionContainer>
  );
};

export interface LoginCharacterSelectionProps {
  redirectAfterLoginCallbackPath: string;
  loginUrl: string;
  redirectOnSelectPath: string;
  charactersKey: string;
  canSelect?: boolean;
}

export const LoginCharacterSelection = ({
  redirectAfterLoginCallbackPath,
  loginUrl,
  redirectOnSelectPath,
  charactersKey,
  canSelect = false,
}: LoginCharacterSelectionProps): ReactElement => {
  const browserCtx = useBrowserContext();
  const forbidSelect = useRef<boolean>(false);
  const [mutCharacters, setMutCharacters] = useState<MutableCharacters>(() =>
    loadMutCharactersOrDefault(browserCtx, charactersKey)
  );

  useEffect(() => {
    if (browserCtx !== null) {
      serverCookiesDelCurrentCharacter(); // logout current character
      clientCookiesSetLoginCallbackRedirect(redirectAfterLoginCallbackPath); // set redirect
      if (mutCharacters.characters.length === 0) {
        setMutCharacters(loadMutCharactersOrDefault(browserCtx, charactersKey));
      }
    }
  }, [browserCtx]);

  const onLogout = (i: number): void => {
    if (forbidSelect.current || browserCtx === null) return;
    console.log("logout " + mutCharacters.characters[i].name);
    mutCharacters.delCharacter(i);
    storageSetCharacters(browserCtx, charactersKey, mutCharacters.characters);
    setMutCharacters(mutCharacters.shallowClone());
  };

  const onSelect = (e: ReactMouseEvent, character: Character): void => {
    if (forbidSelect.current) return e.preventDefault();
    console.log("select " + character.name);
    serverCookiesSetCurrentCharacter(character);
  };

  const onLogin = (e: ReactMouseEvent): void => {
    if (forbidSelect.current) return e.preventDefault();
    console.log("login");
  };

  return (
    <SelectionContainer
      key={mutCharacters.characters.length}
      setForbidSelect={(b: boolean) => (forbidSelect.current = b)}
    >
      {Array.from(
        (function* () {
          for (const [i, character] of mutCharacters.characters.entries()) {
            yield (
              <LoginCharacterPortrait
                key={character.id}
                size={"auto"}
                character={character}
                onTerminate={() => onLogout(i)}
                onClickOrLink={
                  canSelect
                    ? {
                        kind: "link",
                        href: redirectOnSelectPath,
                        onClick: (e) => onSelect(e, character),
                      }
                    : undefined
                }
                nameBar
              />
            );
          }
          yield (
            <LoginCharacterPortrait
              key="add"
              size={"auto"}
              character={{
                refreshToken: "",
                name: "Add Character",
                id: 0,
                admin: false,
                corporationId: -1,
              }}
              nameAlign="center"
              nameBar={true}
              onClickOrLink={{
                kind: "link",
                href: loginUrl,
                onClick: onLogin,
              }}
            />
          );
        })()
      )}
    </SelectionContainer>
  );
};

const loadMutCharactersOrDefault = (
  browserCtx: BrowserContextMarker | null,
  charactersKey: string
): MutableCharacters => {
  if (browserCtx === null) return MutableCharacters.newEmpty();
  return storageGetMutableCharacters(browserCtx, charactersKey);
};

const loadReadonlyCharactersOrDefault = (
  browserCtx: BrowserContextMarker | null,
  charactersKey: string
): ReadonlyCharacters => {
  if (browserCtx === null) return [];
  return storageGetReadonlyCharacters(browserCtx, charactersKey);
};

export interface SelectionTabContainerProps<LEN extends number> {
  tabs: [ReactNode, ...ReactNode[]] & { length: LEN };
  titles: [string, ...string[]] & { length: LEN };
}

export const SelectionTabContainer = <LEN extends number>({
  tabs,
  titles,
}: SelectionTabContainerProps<LEN>): ReactElement => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div
      className={classNames(
        // "w-full",
        "h-full",
        "min-h-[109px]",
        "flex",
        "flex-col",
        "justify-center",
        "content-center"
        // "items-center"
      )}
    >
      <div
        className={classNames("flex-shrink-0", "w-full", "flex", "space-x-1")}
      >
        {titles.map((title, i) => (
          <Tab
            key={i}
            onClick={() => i !== selectedTab && setSelectedTab(i)}
            connect="top"
            active={i === selectedTab}
          >
            {title}
          </Tab>
        ))}
      </div>
      <div
        className={classNames(
          "relative",
          "flex-grow",
          "flex-shrink",
          "min-h-[64px]"
        )}
      >
        <div className={classNames("absolute", "inset-0")}>
          {tabs[selectedTab]}
        </div>
      </div>
    </div>
  );
};

export interface SelectionContainerProps {
  setForbidSelect: (b: boolean) => void;
  children?: Iterable<ReactNode>;
  spacing?: string;
  maxWidth?: string;
}

export const SelectionContainer = ({
  setForbidSelect,
  spacing = "ml-2",
  maxWidth = "max-w-[calc(50%-0.25rem)]",
  children = (function* () {})(),
}: SelectionContainerProps): ReactElement => {
  const browserCtx = useBrowserContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);

  const handleDragStart = (clientX: number): void => {
    setForbidSelect(false);
    setIsDragging(true);
    setStartX(clientX);
    setScrollStartX(ref.current?.scrollLeft ?? 0);
  };

  const handleDragMove = (clientX: number): void => {
    if (!isDragging) return;
    setForbidSelect(true);
    ref.current!.scrollLeft = scrollStartX - (clientX - startX);
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
  };

  const handleDragMoveMouse = (e: MouseEvent) => handleDragMove(e.clientX);

  const handleDragMoveTouch = (e: TouchEvent) =>
    handleDragMove(e.touches[0].clientX);

  useEffect(() => {
    if (browserCtx === null) return;

    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);
    window.addEventListener("mousemove", handleDragMoveMouse);
    window.addEventListener("touchmove", handleDragMoveTouch);
    window.addEventListener("mouseenter", handleDragEnd);

    return () => {
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
      window.removeEventListener("mousemove", handleDragMoveMouse);
      window.removeEventListener("touchmove", handleDragMoveTouch);
      window.removeEventListener("mouseenter", handleDragEnd);
    };
  });

  return (
    <div
      className={classNames(
        // "w-full",
        "h-full",
        "flex",
        "items-center",
        "min-h-[64px]",
        "overflow-auto"
      )}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
    >
      <div
        ref={ref}
        className={classNames(
          "flex",
          "w-full",
          "h-[55%]",
          // "max-h-full",
          "min-h-[64px]",
          "overflow-x-hidden",
          "overflow-y-visible"
        )}
      >
        <span className={classNames("flex-grow")} />
        {Array.from(
          (function* () {
            for (const [i, child] of iterIndexed<ReactNode>(children))
              yield (
                <div
                  key={i}
                  className={classNames("aspect-[1/1]", maxWidth, "h-full", {
                    [spacing]: i > 0,
                  })}
                >
                  {child}
                </div>
              );
          })()
        )}
        <span className={classNames("flex-grow")} />
      </div>
    </div>
  );
};

// export interface CharacterSelectionButtonArgs {
//   className?: string;
//   title: string;
//   onClick: (i: number) => void;
//   status?: (i: number) => SelectableCharacterCardButtonStatus;
// }

// export interface CharacterSelectionProps {
//   characters: ReadonlyCharacters;
//   size?: CharacterPortraitSize;
//   buttons?: CharacterSelectionButtonArgs[];
// }

// export const CharacterSelection = ({
//   characters,
//   size,
//   buttons = [],
// }: CharacterSelectionProps): ReactElement => {
//   // return (
//   //   <div
//   //     className={
//   //       classNames()
//   //       // "flex",
//   //       // "justify-center",
//   //       // "items-center"
//   //       // "flex-wrap",
//   //       // "overflow-auto"
//   //       // "grid",
//   //       // "gap-4",
//   //       // "grid-cols-1",
//   //       // "md:grid-cols-2",
//   //       // "lg:grid-cols-3",
//   //       // "xl:grid-cols-4"
//   //     }
//   //   >
//   //     <LoginCharacterPortrait character={characters[0]} />
//   // return (
//   //   <>
//   //     {characters.map((character, i) => (
//   //       <LoginCharacterPortrait key={character.id} character={character} />
//   //     ))}
//   //   </>
//   // );
//   //   </div>
//   // );
//   return characters.length > 0 ? (
//     <LoginCharacterPortrait character={characters[0]} />
//   ) : (
//     <></>
//   );
// };
