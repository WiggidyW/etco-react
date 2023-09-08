const CODE_VERIFIER_KEY: string = "code_verifier";

export const setCodeVerifier = (codeVerifier: string) =>
  window!.sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

export const loadCodeVerifier = (): string | null =>
  window!.sessionStorage.getItem(CODE_VERIFIER_KEY);
