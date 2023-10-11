import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";
import { ConfigureShopLocations } from "@/components/Configure/ShopLocations";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";

const PATH = "/admin/configure/shop-locations";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureShopLocations refreshToken={character.refreshToken} />
      )}
    </AdminMain>
  );
}
