import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";

const PATH = "/admin";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      Test
    </AdminMain>
  );
}
