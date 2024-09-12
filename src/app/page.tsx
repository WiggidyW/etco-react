import { Main } from "@/components/Main";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ReactElement } from "react";

const PATH = "/";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <Main path={PATH} character={character}>
      <iframe
        src="https://wiki.bravecollective.com/public/alliance/industry/buybacks/lsf-buyback"
        className="w-full h-full"
      />
    </Main>
  );
}
