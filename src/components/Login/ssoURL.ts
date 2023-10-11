import * as cryptojs from "crypto-js";
import { EveApp } from "@/eveapps";

const newRandomState = (): string =>
  cryptojs.lib.WordArray.random(16).toString();

export const newWebLoginUrl = (eveApp: EveApp): string =>
  "https://login.eveonline.com/v2/oauth/authorize/" +
  "?response_type=code" +
  `&state=${encodeURI(newRandomState())}` +
  `&client_id=${encodeURI(eveApp.clientId!)}` +
  `&redirect_uri=${encodeURI(eveApp.redirectUrl!)}` +
  `${
    eveApp.scopes.length > 0
      ? `&scope=${encodeURI(eveApp.scopes.join(" "))}`
      : ""
  }`;
