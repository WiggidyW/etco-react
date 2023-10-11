"use client";

import { useBrowserContext } from "@/browser/context";
import { ReactElement, useMemo } from "react";

export interface RemainingProps {
  expiresUnix: number;
}
export const Remaining = ({ expiresUnix }: RemainingProps): ReactElement => {
  const browserCtx = useBrowserContext();
  const remainingStr = useMemo(() => {
    const duration = expiresUnix - Date.now() / 1000;
    if (duration < 0) {
      return "expired";
    }
    const days = Math.floor(duration / 86400);
    const hours = Math.floor((duration - days * 86400) / 3600);
    const minutes = Math.floor((duration - days * 86400 - hours * 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }, [expiresUnix]);
  if (browserCtx === null) {
    return <></>;
  } else {
    return <>{remainingStr}</>;
  }
};
