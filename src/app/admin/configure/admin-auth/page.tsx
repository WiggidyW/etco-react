import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";
import { ConfigureAuthList } from "@/components/Configure/AuthList";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";

const PATH = "/admin/configure/admin-auth";
const DOMAIN_KEY = "admin";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureAuthList
          domain={DOMAIN_KEY}
          refreshToken={character.refreshToken}
        />
      )}
    </AdminMain>
  );
}
