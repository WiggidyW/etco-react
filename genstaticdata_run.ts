import dotenv from "dotenv";
dotenv.config();

import { genStaticData } from "./genstaticdata";

(async () => {
  try {
    await genStaticData("src/proto/staticdata");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
