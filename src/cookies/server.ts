"use server";

import { Character, ICharacter } from "@/browser/character";
import { PUBLIC_ENV } from "@/env/public";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const getCookieSetOptOrDefault = <K extends keyof ResponseCookie>(
  opts: Partial<ResponseCookie>,
  property: K,
  defaultVal: ResponseCookie[K]
): Partial<ResponseCookie>[K] =>
  property in opts ? opts[property] : defaultVal;

const newCookieSetOpts = (
  opts: Partial<ResponseCookie> = {}
): Partial<ResponseCookie> => ({
  path: getCookieSetOptOrDefault(opts, "path", "/"),
  expires: getCookieSetOptOrDefault(opts, "expires", undefined),
  maxAge: getCookieSetOptOrDefault(opts, "maxAge", undefined),
  domain: getCookieSetOptOrDefault(opts, "domain", PUBLIC_ENV.BASE_DOMAIN),
  secure: getCookieSetOptOrDefault(opts, "secure", !PUBLIC_ENV.DEV_MODE),
  httpOnly: getCookieSetOptOrDefault(opts, "httpOnly", true),
  sameSite: getCookieSetOptOrDefault(opts, "sameSite", "lax"),
  priority: getCookieSetOptOrDefault(opts, "priority", "high"),
  // name,
  // value
});

export const serverCookiesGetCurrentCharacter = (): Character | null => {
  const val = cookies().get("currentCharacter")?.value;
  if (val === undefined) {
    return null;
  } else {
    return Character.fromStr(val);
  }
};

export const serverCookiesSetCurrentCharacter = async (
  character: ICharacter
): Promise<void> => {
  cookies().set(
    "currentCharacter",
    JSON.stringify(character),
    newCookieSetOpts({ maxAge: 60 * 60 * 24 * 30 }) // 30 days
  );
};

export const serverCookiesDelCurrentCharacter = async (): Promise<void> => {
  cookies().set(
    "currentCharacter",
    "",
    newCookieSetOpts({ expires: new Date(0) })
  );
};

export const serverCookiesGetLoginCallbackRedirect = (): string | null => {
  const val = cookies().get("loginCallbackRedirect")?.value;
  if (val === undefined) {
    return null;
  } else {
    return val;
  }
};

export const serverCookiesGetTheme = (): "light" | "dark" | null => {
  const val = cookies().get("theme")?.value;
  if (val === undefined) {
    return null;
  } else if (val === "light" || val === "dark") {
    return val;
  } else {
    return null;
  }
};
