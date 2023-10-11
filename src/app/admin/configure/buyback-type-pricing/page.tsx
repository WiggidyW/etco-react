import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";
import { ConfigureBuybackTypePricing } from "@/components/Configure/BuybackTypePricing";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";

const PATH = "/admin/configure/buyback-type-pricing";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureBuybackTypePricing refreshToken={character.refreshToken} />
      )}
    </AdminMain>
  );
}
