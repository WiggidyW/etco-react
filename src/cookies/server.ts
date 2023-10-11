import { Character } from "@/browser/character";
import { cookies } from "next/headers";

export const serverCookiesGetCurrentCharacter = (): Character | null => {
  const val = cookies().get("currentCharacter")?.value;
  if (val === undefined) {
    return null;
  } else {
    return Character.fromStr(val);
  }
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

export const serverCookiesGetCheckIsAdmin = (): boolean => {
  const val = cookies().get("checkIsAdmin")?.value;
  if (val === "true") {
    return true;
  } else {
    return false;
  }
};
