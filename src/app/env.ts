const PublicEnvVars = {
  DEV_MODE: process.env.NEXT_PUBLIC_ETCO_DEV_MODE === "true",
  BASE_DOMAIN: process.env.NEXT_PUBLIC_ETCO_BASE_DOMAIN,
  CORP_NAME: process.env.NEXT_PUBLIC_ETCO_CORP_NAME,
  BASE_URL: process.env.NEXT_PUBLIC_ETCO_BASE_URL,
};

const PrivateEnvVars = {
  GRPC_URL: process.env.ETCO_GRPC_URL,
  EVE_AUTH_CLIENT_ID: process.env.ETCO_EVE_AUTH_CLIENT_ID,
  EVE_AUTH_CLIENT_SECRET: process.env.ETCO_EVE_AUTH_CLIENT_SECRET,
  EVE_MARKETS_CLIENT_ID: process.env.ETCO_EVE_MARKETS_CLIENT_ID,
  EVE_MARKETS_CLIENT_SECRET: process.env.ETCO_EVE_MARKETS_CLIENT_SECRET,
  EVE_STRUCTURE_INFO_CLIENT_ID: process.env.ETCO_EVE_STRUCTURE_INFO_CLIENT_ID,
  EVE_STRUCTURE_INFO_CLIENT_SECRET:
    process.env.ETCO_EVE_STRUCTURE_INFO_CLIENT_SECRET,
  EVE_CORPORATION_CLIENT_ID: process.env.ETCO_EVE_CORPORATION_CLIENT_ID,
  EVE_CORPORATION_CLIENT_SECRET: process.env.ETCO_EVE_CORPORATION_CLIENT_SECRET,
};

export class EnvStore {
  static getPublic<K extends keyof typeof PublicEnvVars>(
    k: K
  ): (typeof PublicEnvVars)[K] {
    const val = PublicEnvVars[k];
    if (val === undefined) {
      throw new Error(`Missing required public environment variable: ${k}`);
    }
    return val;
  }
  static getPrivate<K extends keyof typeof PrivateEnvVars>(
    k: K
  ): (typeof PrivateEnvVars)[K] {
    const val = PrivateEnvVars[k];
    if (val === undefined) {
      throw new Error(`Missing required private environment variable: ${k}`);
    }
    return val;
  }
}
