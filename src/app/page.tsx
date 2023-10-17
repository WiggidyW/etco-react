import { Main } from "@/components/Main";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ReactElement } from "react";

const PATH = "/";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return <Main path={PATH} character={character} />;
}
