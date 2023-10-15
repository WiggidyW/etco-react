import dotenv from "dotenv";
dotenv.config();

import { genStaticData } from "./genstaticdata_lib";

const MAX_RETRY_ATTEMPTS: number = 3;
const RETRY_SLEEP_MS: number = 5000;

(async () => {
  for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
    try {
      await genStaticData("src/proto/staticdata");
      console.log("generated static data");
      process.exit(0);
    } catch (e) {
      console.error(e);
    }
    console.log(`retrying in ${RETRY_SLEEP_MS / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_SLEEP_MS));
  }
  console.error("failed to generate static data");
  process.exit(1);
})();
