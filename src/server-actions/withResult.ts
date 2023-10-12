"use server";

import { Result, ResultErr, ResultOk } from "@/components/todo";

export const withCatchResult =
  <T, A extends any[]>(
    fn: (...args: A) => Promise<T>
  ): ((...args: A) => Promise<Result<T, unknown>>) =>
  async (...args: A) =>
    fn(...args).then(
      (ok) => ResultOk(ok),
      (err) => ResultErr(err)
    );
