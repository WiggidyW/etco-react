export interface EveApp {
  clientId: string;
  redirectUrl: string;
  scopes: string[];
  charactersKey: string;
  currentCharacterKey: string;
  tokenPrefix: string;
}

export enum EveAppKind {
  Auth = 0,
  Markets = 1,
  StructureInfo = 2,
  Corporation = 3,
}

export type AdminEveAppKind =
  | EveAppKind.Corporation
  | EveAppKind.Markets
  | EveAppKind.StructureInfo;

export const UserEveAppKind = EveAppKind.Auth;

export const getEveApp = (kind: EveAppKind): EveApp => {
  const eveApp = EVE_APPS[kind];
  if (eveApp.clientId === "") throw new Error(`no client id for ${kind}`);
  if (eveApp.redirectUrl === "") throw new Error(`no redirect url for ${kind}`);
  return eveApp;
};

const redirectUrl = (callback: string): string =>
  process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/${callback}`
    : "";

const EVE_APPS: { [key in EveAppKind]: EveApp } = {
  [EveAppKind.Auth]: {
    clientId: process.env.NEXT_PUBLIC_EVE_AUTH_CLIENT_ID ?? "",
    redirectUrl: redirectUrl("eveauthcallback-auth"),
    scopes: [] as string[],
    charactersKey: "characters",
    currentCharacterKey: "current_character",
    tokenPrefix: "token",
  },
  [EveAppKind.Markets]: {
    clientId: process.env.NEXT_PUBLIC_EVE_MARKETS_CLIENT_ID ?? "",
    redirectUrl: redirectUrl("eveauthcallback-markets"),
    scopes: ["esi-markets.structure_markets.v1"],
    charactersKey: "markets_characters",
    currentCharacterKey: "markets_current_character",
    tokenPrefix: "markets_token",
  },
  [EveAppKind.StructureInfo]: {
    clientId: process.env.NEXT_PUBLIC_EVE_STRUCTURE_INFO_CLIENT_ID ?? "",
    redirectUrl: redirectUrl("eveauthcallback-structureinfo"),
    scopes: ["esi-universe.read_structures.v1"],
    charactersKey: "structureinfo_characters",
    currentCharacterKey: "structureinfo_current_character",
    tokenPrefix: "structureinfo_token",
  },
  [EveAppKind.Corporation]: {
    clientId: process.env.NEXT_PUBLIC_EVE_CORPORATION_CLIENT_ID ?? "",
    redirectUrl: redirectUrl("eveauthcallback-corporation"),
    scopes: [
      "esi-assets.read_corporation_assets.v1",
      "esi-contracts.read_corporation_contracts.v1",
    ],
    charactersKey: "corporation_characters",
    currentCharacterKey: "corporation_current_character",
    tokenPrefix: "corporation_token",
  },
};
