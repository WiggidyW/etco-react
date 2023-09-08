"use client";

import { ReactElement, useState } from "react";
import { newNativeLoginUrl, newWebLoginUrl } from "./newUrl";
import { CharacterSelection } from "./CharacterSelection";
import { useRouter } from "next/navigation";
import { EveAppKind, getEveApp } from "@/eveapps";
import { storageLoadPath, setIsAdminLogin, setLoginPath } from "@/storage/path";
import { CharactersManager } from "@/storage/appAuth/characters";
import { AdminCharactersManager } from "@/storage/appOther/characters";

const useReRender = (): (() => void) => {
  const [reRender, setReRender] = useState<boolean>(false);
  return () => setReRender(!reRender);
};

export const AdminLogin = (): ReactElement => {
  const reRender = useReRender();
  const router = useRouter();
  const path = storageLoadPath() ?? "";
  const authCharacters = CharactersManager.getCharacters();
  const marketsCharacters =
    AdminCharactersManager.getMarketInstance().getCharacters();
  const corporationCharacters =
    AdminCharactersManager.getCorporationInstance().getCharacters();
  const structureInfoCharacters =
    AdminCharactersManager.getStructureInfoInstance().getCharacters();

  setLoginPath(path); // store the redirect path for usage by the callback page
  setIsAdminLogin(true);

  return (
    <>
      <CharacterSelection
        characters={authCharacters}
        loginUrl={newNativeLoginUrl(getEveApp(EveAppKind.Auth))}
        onLogout={(index: number) => {
          CharactersManager.delCharacter(index);
          reRender();
        }}
        onSelect={(index: number) => {
          CharactersManager.setCurrentCharacter(index);
          router.push(path);
        }}
      />
      <p className="text-center text-2xl font-bold">Markets Characters</p>
      <CharacterSelection
        characters={marketsCharacters}
        loginUrl={newWebLoginUrl(getEveApp(EveAppKind.Markets))}
        onLogout={(index: number) => {
          AdminCharactersManager.getMarketInstance().delCharacter(index);
          reRender();
        }}
      />
      <p className="text-center text-2xl font-bold">Corporation Characters</p>
      <CharacterSelection
        characters={corporationCharacters}
        loginUrl={newWebLoginUrl(getEveApp(EveAppKind.Corporation))}
        onLogout={(index: number) => {
          AdminCharactersManager.getCorporationInstance().delCharacter(index);
          reRender();
        }}
      />
      <p className="text-center text-2xl font-bold">
        Structure Info Characters
      </p>
      <CharacterSelection
        characters={structureInfoCharacters}
        loginUrl={newWebLoginUrl(getEveApp(EveAppKind.StructureInfo))}
        onLogout={(index: number) => {
          AdminCharactersManager.getStructureInfoInstance().delCharacter(index);
          reRender();
        }}
      />
    </>
  );
};

export const UserLogin = (): ReactElement => {
  const reRender = useReRender();
  const router = useRouter();
  const path = storageLoadPath() ?? "";
  const authCharacters = CharactersManager.getCharacters();

  setLoginPath(path); // store the redirect path for usage by the callback page
  setIsAdminLogin(false);

  return (
    <CharacterSelection
      characters={authCharacters}
      loginUrl={newNativeLoginUrl(getEveApp(EveAppKind.Auth))}
      onLogout={(index: number) => {
        CharactersManager.delCharacter(index);
        reRender();
      }}
      onSelect={(index: number) => {
        CharactersManager.setCurrentCharacter(index);
        router.push(path);
      }}
    />
  );
};
