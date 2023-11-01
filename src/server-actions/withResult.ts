"use server";

import { Result, ResultErr, ResultOk } from "@/components/todo";
import { unknownToParsedJSONError } from "@/error/error";

export const withCatchResult =
  <T, A extends any[]>(
    fn: (...args: A) => Promise<T>
  ): ((...args: A) => Promise<Result<T, unknown>>) =>
  async (...args: A) =>
    fn(...args).then(
      (ok) => ResultOk(ok),
      (err) => {
        const errStr = unknownToParsedJSONError(err).toErrorMinified().message;
        if (errStr) console.error(errStr); // somehow it logs null in development if I don't check
        return ResultErr(errStr);
      }
    );
