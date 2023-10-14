const { PRIVATE_ENV } = require ("./private");
const { PUBLIC_ENV } = require ("./public");

const validateEnv = () => {
  for (const [k, v] of Object.entries(PUBLIC_ENV)) {
    if (v === undefined) {
      throw new Error(`Missing required public environment variable: ${k}`);
    }
  }
  for (const [k, v] of Object.entries(PRIVATE_ENV)) {
    if (v === undefined) {
      throw new Error(`Missing required private environment variable: ${k}`);
    }
  }
};

module.exports = { validateEnv };
