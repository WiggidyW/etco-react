import { EveAppKind, getEveApp } from "@/eveapps";

export const tokenKey = (eveAppKind: EveAppKind, characterId: number): string =>
  `${getEveApp(eveAppKind).tokenPrefix}-${characterId}`;

export const loadToken = (key: string): string | null =>
  window!.localStorage.getItem(key);

export const setToken = (key: string, token: string): void =>
  window!.localStorage.setItem(key, token);

export const delToken = (key: string): void =>
  window!.localStorage.removeItem(key);
