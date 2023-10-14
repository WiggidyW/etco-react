export interface PublicEnv {
  DEV_MODE: boolean;
  BASE_DOMAIN: string;
  CORP_NAME: string;
  BASE_URL: string;
}

export const PUBLIC_ENV: PublicEnv;
