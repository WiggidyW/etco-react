import { EnvStore } from "./env";

export interface EveApp {
  kind: EveAppKind;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scopes: string[];
  charactersKey: string;
  canBeAdmin: boolean;
}

export type EveAppKind = "Auth" | "Markets" | "StructureInfo" | "Corporation";

export const EveAppKinds: ["Auth", "Markets", "StructureInfo", "Corporation"] =
  ["Auth", "Markets", "StructureInfo", "Corporation"];

export const CurrentCharacterEveAppKind: EveAppKind = "Auth";

const redirectUrl = (callback: string): string =>
  `${EnvStore.getPublic("BASE_URL")!}/${callback}`;

export const EveApps: { [key in EveAppKind]: EveApp } = {
  Auth: {
    kind: "Auth",
    clientId: EnvStore.getPrivate("EVE_AUTH_CLIENT_ID")!,
    clientSecret: EnvStore.getPrivate("EVE_AUTH_CLIENT_SECRET")!,
    redirectUrl: redirectUrl("eveauthcallback-auth"),
    scopes: [],
    charactersKey: "characters",
    canBeAdmin: true,
  },
  Markets: {
    kind: "Markets",
    clientId: EnvStore.getPrivate("EVE_MARKETS_CLIENT_ID")!,
    clientSecret: EnvStore.getPrivate("EVE_MARKETS_CLIENT_SECRET")!,
    redirectUrl: redirectUrl("eveauthcallback-markets"),
    scopes: ["esi-markets.structure_markets.v1"],
    charactersKey: "markets_characters",
    canBeAdmin: false,
  },
  StructureInfo: {
    kind: "StructureInfo",
    clientId: EnvStore.getPrivate("EVE_STRUCTURE_INFO_CLIENT_ID")!,
    clientSecret: EnvStore.getPrivate("EVE_STRUCTURE_INFO_CLIENT_SECRET")!,
    redirectUrl: redirectUrl("eveauthcallback-structureinfo"),
    scopes: ["esi-universe.read_structures.v1"],
    charactersKey: "structureinfo_characters",
    canBeAdmin: false,
  },
  Corporation: {
    kind: "Corporation",
    clientId: EnvStore.getPrivate("EVE_CORPORATION_CLIENT_ID")!,
    clientSecret: EnvStore.getPrivate("EVE_CORPORATION_CLIENT_SECRET")!,
    redirectUrl: redirectUrl("eveauthcallback-corporation"),
    scopes: [
      "esi-assets.read_corporation_assets.v1",
      "esi-contracts.read_corporation_contracts.v1",
    ],
    charactersKey: "corporation_characters",
    canBeAdmin: false,
  },
};
