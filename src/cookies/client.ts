"use client";

import { Character, ICharacter } from "@/browser/character";
import Cookies from "universal-cookie";
import { EnvStore } from "@/env";

const clientCookiesGet = (key: string): string | null => {
  const val = new Cookies().get(key, { doNotParse: true });
  if (val === undefined || val === null) {
    return null;
  } else if (typeof val !== "string") {
    throw new Error(`invalid cookie value: ${val}`);
  } else {
    return val;
  }
};

// // Current Character

export const clientCookiesGetCurrentCharacter = (): Character | null => {
  const val = clientCookiesGet("currentCharacter");
  if (val === null) {
    return null;
  } else {
    return Character.fromStr(val);
  }
};

export const clientCookiesSetCurrentCharacter = (
  character: Character | ICharacter
): void => {
  new Cookies().set("currentCharacter", JSON.stringify(character), {
    domain: EnvStore.getPublic("BASE_DOMAIN"),
    secure: !EnvStore.getPublic("DEV_MODE"),
    path: "/",
    expires: undefined,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,
    sameSite: "lax",
  });
};

export const clientCookiesDelCurrentCharacter = (): void =>
  new Cookies().remove("currentCharacter");

// // Login Callback Redirect Path

export const clientCookiesGetLoginCallbackRedirect = (): string | null =>
  clientCookiesGet("loginCallbackRedirect");

export const clientCookiesSetLoginCallbackRedirect = (
  redirectPath: string
): void => {
  new Cookies().set("loginCallbackRedirect", redirectPath, {
    domain: EnvStore.getPublic("BASE_DOMAIN"),
    secure: !EnvStore.getPublic("DEV_MODE"),
    path: "/",
    expires: undefined,
    maxAge: 60 * 30, // 30 minutes
    httpOnly: false,
    sameSite: "lax",
  });
};

export const clientCookiesDelLoginCallbackRedirect = (): void =>
  new Cookies().remove("loginCallbackRedirect");

// // Theme

export const clientCookiesGetTheme = (): "light" | "dark" | null => {
  const val = clientCookiesGet("theme");
  if (val === null) {
    return null;
  } else if (val === "light" || val === "dark") {
    return val;
  } else {
    return null;
  }
};

export const clientCookiesSetTheme = (theme: "light" | "dark"): void => {
  new Cookies().set("theme", theme, {
    domain: EnvStore.getPublic("BASE_DOMAIN"),
    secure: !EnvStore.getPublic("DEV_MODE"),
    path: "/",
    expires: undefined,
    maxAge: 60 * 60 * 24 * 365, // 365 days
    httpOnly: false,
    sameSite: "lax",
  });
};

export const clientCookiesDelTheme = (): void => new Cookies().remove("theme");

// // Check Is Admin

export const clientCookiesGetCheckIsAdmin = (): boolean => {
  const val = clientCookiesGet("checkIsAdmin");
  if (val === "true") {
    return true;
  } else {
    return false;
  }
};

export const clientCookiesSetCheckIsAdmin = (isAdmin: boolean): void => {
  new Cookies().set("checkIsAdmin", isAdmin.toString(), {
    domain: EnvStore.getPublic("BASE_DOMAIN"),
    secure: !EnvStore.getPublic("DEV_MODE"),
    path: "/",
    expires: undefined,
    maxAge: 60 * 30, // 30 minutes
    httpOnly: false,
    sameSite: "strict",
  });
};

export const clientCookiesDelCheckIsAdmin = (): void =>
  new Cookies().remove("checkIsAdmin");
