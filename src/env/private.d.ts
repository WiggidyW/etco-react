export interface PrivateEnv {
  GRPC_URL: string;
  EVE_AUTH_CLIENT_ID: string;
  EVE_MARKETS_CLIENT_ID: string;
  EVE_STRUCTURE_INFO_CLIENT_ID: string;
  EVE_CORPORATION_CLIENT_ID: string;
}

export const PRIVATE_ENV: PrivateEnv;
