"use client";

import { useBrowserContext, BrowserContextMarker } from "@/browser/context";
import {
  storageGetMutableCharacters,
  storageSetCharacters,
} from "@/browser/storage";
import { Character, ICharacter } from "@/browser/character";
import { ReactElement, useEffect } from "react";
import { Loading } from "@/components/Loading";
import { useRouter } from "next/navigation";

export interface EveAuthCallbackClientSideProps {
  character: ICharacter;
  charactersKey: string;
  redirectHref: string;
}

export const EveAuthCallbackClientSide = ({
  character,
  charactersKey,
  redirectHref,
}: EveAuthCallbackClientSideProps): ReactElement => {
  const browserCtx = useBrowserContext();
  const router = useRouter();

  useEffect(() => {
    if (browserCtx === null) return;
    addCharacter(browserCtx, charactersKey, character, () =>
      router.push(redirectHref)
    );
  }, [browserCtx]);

  return <Loading scale="25%" />;
};

const addCharacter = (
  browserCtx: BrowserContextMarker,
  charactersKey: string,
  character: ICharacter,
  onFinish: () => void
): void => {
  const characterParsed = Character.fromObject(character);
  const mutCharacters = storageGetMutableCharacters(browserCtx, charactersKey);
  mutCharacters.addCharacter(characterParsed);
  storageSetCharacters(browserCtx, charactersKey, mutCharacters.characters);
  onFinish();
};
