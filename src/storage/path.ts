"use client";

const PATH_KEY: string = "path";
const LOGIN_PATH_KEY: string = "login_path";
const IS_ADMIN_LOGIN_KEY: string = "is_admin_login";

export const storageSetPath = (path: string) =>
  window!.sessionStorage.setItem(PATH_KEY, path);

export const storageLoadPath = (): string | null =>
  window!.sessionStorage.getItem(PATH_KEY);

export const storageDelPath = () => window!.sessionStorage.removeItem(PATH_KEY);

export const setLoginPath = (path: string) =>
  window!.sessionStorage.setItem(LOGIN_PATH_KEY, `${path}/login`);

export const loadLoginPath = (): string | null =>
  window!.sessionStorage.getItem(LOGIN_PATH_KEY);

export const delLoginPath = () =>
  window!.sessionStorage.removeItem(LOGIN_PATH_KEY);

// If a user that is not an admin manages to set this, it's fine.
// They'll just have a bad experience. :(

export const setIsAdminLogin = (isAdminLogin: boolean) =>
  isAdminLogin
    ? window!.sessionStorage.setItem(IS_ADMIN_LOGIN_KEY, "")
    : window!.sessionStorage.removeItem(IS_ADMIN_LOGIN_KEY);

export const loadIsAdminLogin = (): boolean =>
  window!.sessionStorage.getItem(IS_ADMIN_LOGIN_KEY) !== null;
