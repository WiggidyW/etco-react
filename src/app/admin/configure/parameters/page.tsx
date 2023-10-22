import { ConfigureConstData } from "@/components/Configure/ConstData";
import { ReactElement } from "react";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { AdminMain } from "@/components/Main";
import { EveApps } from "@/eveapps";

const PATH = "/admin/configure/parameters";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureConstData
          refreshToken={character.refreshToken}
          corporationCharactersKey={EveApps.Corporation.charactersKey}
          structureInfoCharactersKey={EveApps.StructureInfo.charactersKey}
        />
      )}
    </AdminMain>
  );
}
