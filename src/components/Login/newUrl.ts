import * as cryptojs from "crypto-js";
import { EveApp } from "../../eveapps";
import { setCodeVerifier } from "@/storage/code_verifier";

// base64url encode a sha256 hash of a string
const newCodeChallenge = (): string => {
  // base64url encode an array of 32 bytes
  const codeVerifier = cryptojs.enc.Base64url.stringify(
    cryptojs.lib.WordArray.random(32)
  );
  // save the code verifier in session storage
  setCodeVerifier(codeVerifier);
  // base64url encode a sha256 hash of the code verifier
  return cryptojs.enc.Base64url.stringify(cryptojs.SHA256(codeVerifier));
};

const newRandomState = (): string =>
  cryptojs.lib.WordArray.random(16).toString();

export const newWebLoginUrl = (eveApp: EveApp): string =>
  "https://login.eveonline.com/v2/oauth/authorize/" +
  "?response_type=code" +
  `&state=${encodeURI(newRandomState())}` +
  `&client_id=${encodeURI(eveApp.clientId)}` +
  `&redirect_uri=${encodeURI(eveApp.redirectUrl)}` +
  `${
    eveApp.scopes.length > 0
      ? `&scope=${encodeURI(eveApp.scopes.join(" "))}`
      : ""
  }`;

export const newNativeLoginUrl = (eveApp: EveApp): string =>
  newWebLoginUrl(eveApp) +
  "&code_challenge_method=S256" +
  `&code_challenge=${newCodeChallenge()}`;
