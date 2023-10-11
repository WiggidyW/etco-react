import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";
import { ConfigureBuybackSystems } from "@/components/Configure/BuybackSystems";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";

const PATH = "/admin/configure/buyback-systems";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureBuybackSystems refreshToken={character.refreshToken} />
      )}
    </AdminMain>
  );
}
