import { AdminMain } from "@/components/Main";
import { ReactElement } from "react";
import { ConfigureShopTypePricing } from "@/components/Configure/ShopTypePricing";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";

const PATH = "/admin/configure/shop-type-pricing";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <ConfigureShopTypePricing refreshToken={character.refreshToken} />
      )}
    </AdminMain>
  );
}
