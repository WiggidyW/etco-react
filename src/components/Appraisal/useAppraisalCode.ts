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
      history.pushState({}, "", `${basePath}/${code}`);
    }
  }, [browserCtx, basePath, code]);
};
