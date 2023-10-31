import {
  clientCookiesDelShopParseKey,
  clientCookiesGetShopParseKey,
  clientCookiesSetShopParseKey,
} from "@/cookies/client";
import { BrowserContextMarker } from "./context";
import { storageGetShopParseText, storageSetShopParseText } from "./storage";

export interface ShopParseText {
  sessionKey: string;
  locationId: string;
  text: string;
}

export const clientSetShopParseText = (
  ctx: BrowserContextMarker,
  locationId: string | null,
  text: string | null
): void => {
  if (text && locationId) {
    const sessionKey = Math.random().toString(36).substring(2);
    clientCookiesSetShopParseKey(sessionKey);
    storageSetShopParseText(ctx, { sessionKey, locationId, text });
  } else {
    clientCookiesDelShopParseKey();
  }
};

export const clientGetShopParseText = (
  ctx: BrowserContextMarker,
  locationId: string,
  delCookie: boolean = true
): string | null => {
  const sessionKey = clientCookiesGetShopParseKey();
  if (!sessionKey) return null;

  if (delCookie) clientCookiesDelShopParseKey();

  const text = storageGetShopParseText(ctx, sessionKey, locationId);
  if (!text) return null;

  return text;
};
