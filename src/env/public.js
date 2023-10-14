const PUBLIC_ENV = {
  DEV_MODE: process.env.NEXT_PUBLIC_ETCO_DEV_MODE === "true",
  BASE_DOMAIN: process.env.NEXT_PUBLIC_ETCO_BASE_DOMAIN,
  CORP_NAME: process.env.NEXT_PUBLIC_ETCO_CORP_NAME,
  BASE_URL: process.env.NEXT_PUBLIC_ETCO_BASE_URL,
};

module.exports = { PUBLIC_ENV };
