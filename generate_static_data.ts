import dotenv from "dotenv";
dotenv.config();

import { generateStaticData } from "./src/proto/rpc_gen_static";

(async () => {
  try {
    await generateStaticData("src/proto/staticdata");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
