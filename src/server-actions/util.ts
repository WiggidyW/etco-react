import {
  Result,
  Option,
  OptionNone,
  OptionSome,
  ResultErr,
} from "@/components/todo";
import { useEffect, useState } from "react";

export const useServerAction = <T>(
  action: () => Promise<Result<T, unknown>>
): Option<T> => {
  // call the promise immediately
  const resultPromise = useState<Promise<Result<T, unknown>>>(() =>
    action().catch((e) => ResultErr(e))
  )[0];

  // don't throw promise or set result until initialized
  const [result, setResult] = useState<Result<T, unknown> | null>(null);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  if (!initialized) {
    // do nothing until after first render
    return OptionNone;
  } else if (result === null) {
    // throw promise for Suspense
    throw resultPromise.then(setResult);
  } else if (result.ok) {
    // return value
    return OptionSome(result.value);
  } else {
    // throw error
    throw result.error;
  }
};
