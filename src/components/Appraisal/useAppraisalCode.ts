import { useBrowserContext } from "@/browser/context";
import { useEffect, useRef } from "react";

export const useAppraisalCodeURIEffect = (
  basePath: string,
  code: string | null
): void => {
  const browserCtx = useBrowserContext();
  const uriHistory = useRef<{ code: string | null; basePath: string }>({
    code: null,
    basePath,
  });

  useEffect(() => {
    if (
      browserCtx !== null &&
      (uriHistory.current.code !== code ||
        uriHistory.current.basePath !== basePath)
    ) {
      // inject code into the URL without triggering refresh
      uriHistory.current = { code, basePath };
      setTimeout(() => {
        // I have no idea why the timeout is necessary but it is
        // TODO: Revisit this if related dependencies (like Next.js) are updated, to see if the issue persists.
        if (code === "" || code === null) {
          window.history.pushState({}, "", basePath);
        } else {
          window.history.pushState({}, "", `${basePath}/${code}`);
        }
      }, 1);
    }
  }, [browserCtx, basePath, code]);
};
