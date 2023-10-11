import { ConfigureMarkets } from "@/components/Configure/Markets";
import { ReactElement } from "react";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { AdminMain } from "@/components/Main";
import { EveApps } from "@/eveapps";

const PATH = "/admin/configure/markets";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureMarkets
          refreshToken={character.refreshToken}
          marketCharactersKey={EveApps.Markets.charactersKey}
        />
      )}
    </AdminMain>
  );
}
