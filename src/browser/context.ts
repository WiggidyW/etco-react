import { useEffect, useState } from "react";

export class BrowserContextMarker {
  constructor(
    private readonly _: PreventBrowserContextFromBeingConstructedAnywhereElse
  ) {}
}

export const useBrowserContext = (): BrowserContextMarker | null => {
  const [marker, setMarker] = useState<BrowserContextMarker | null>(
    LoadableBrowserContextMarker.inner
  );

  useEffect(() => {
    if (marker === null) {
      if (LoadableBrowserContextMarker.inner === null) {
        LoadableBrowserContextMarker.inner = newBrowserContextMarker();
      }
      setMarker(LoadableBrowserContextMarker.inner);
    }
  }, []);

  return marker;
};

class PreventBrowserContextFromBeingConstructedAnywhereElse {
  constructor() {}
}
const newBrowserContextMarker = (): BrowserContextMarker =>
  new BrowserContextMarker(
    new PreventBrowserContextFromBeingConstructedAnywhereElse()
  );

const LoadableBrowserContextMarker: {
  inner: BrowserContextMarker | null;
} = { inner: null };
