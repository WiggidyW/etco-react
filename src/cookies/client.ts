"use client";

import { Character, ICharacter } from "@/browser/character";
import Cookies, { CookieSetOptions } from "universal-cookie";
import { EnvStore } from "@/env";

const getCookieSetOptOrDefault = <K extends keyof CookieSetOptions>(
  opts: CookieSetOptions,
  property: K,
  defaultVal: CookieSetOptions[K]
): CookieSetOptions[K] => (property in opts ? opts[property] : defaultVal);

const newCookieSetOpts = (opts: CookieSetOptions = {}): CookieSetOptions => ({
  path: getCookieSetOptOrDefault(opts, "path", "/"),
  expires: getCookieSetOptOrDefault(opts, "expires", undefined),
  maxAge: getCookieSetOptOrDefault(opts, "maxAge", undefined),
  domain: getCookieSetOptOrDefault(
    opts,
    "domain",
    EnvStore.getPublic("BASE_DOMAIN")
  ),
  secure: getCookieSetOptOrDefault(
    opts,
    "secure",
    !EnvStore.getPublic("DEV_MODE")
  ),
  httpOnly: getCookieSetOptOrDefault(opts, "httpOnly", false),
  sameSite: getCookieSetOptOrDefault(opts, "sameSite", "lax"),
});

export const clientCookiesSetCurrentCharacter = (
  character: Character | ICharacter
): void =>
  new Cookies().set(
    "currentCharacter",
    JSON.stringify(character),
    newCookieSetOpts({ maxAge: 60 * 60 * 24 * 30 }) // 30 days
  );

export const clientCookiesDelCurrentCharacter = (): void =>
  new Cookies().set(
    "currentCharacter",
    "",
    newCookieSetOpts({ expires: new Date(0) })
  );

// // Login Callback Redirect Path

export const clientCookiesSetLoginCallbackRedirect = (
  redirectPath: string
): void =>
  new Cookies().set(
    "loginCallbackRedirect",
    redirectPath,
    newCookieSetOpts({ maxAge: 60 * 30 }) // 30 minutes
  );

export const clientCookiesDelLoginCallbackRedirect = (): void =>
  new Cookies().set(
    "loginCallbackRedirect",
    "",
    newCookieSetOpts({ expires: new Date(0) })
  );

// // Theme

export const clientCookiesSetTheme = (theme: "light" | "dark"): void =>
  new Cookies().set(
    "theme",
    theme,
    newCookieSetOpts({ maxAge: 60 * 60 * 24 * 365 }) // 365 days
  );

export const clientCookiesDelTheme = (): void =>
  new Cookies().set("theme", "", newCookieSetOpts({ expires: new Date(0) }));

// // Check Is Admin

export const clientCookiesSetCheckIsAdmin = (isAdmin: boolean): void =>
  new Cookies().set(
    "checkIsAdmin",
    isAdmin.toString(),
    newCookieSetOpts({ maxAge: 60 * 30 }) // 30 minutes
  );

export const clientCookiesDelCheckIsAdmin = (): void =>
  new Cookies().set(
    "checkIsAdmin",
    "",
    newCookieSetOpts({ expires: new Date(0) })
  );
