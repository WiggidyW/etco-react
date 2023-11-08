import { Character } from "./character";
import { ReadonlyCharacters, MutableCharacters } from "./characters";
import { BrowserContextMarker } from "./context";
import { ShopParseText } from "./shopparsetext";

class MockStorage implements Storage {
  readonly length: number = 0;
  constructor() {}
  clear = (): void => {};
  getItem = (_: string): string | null => null;
  key = (_: number): string | null => null;
  removeItem = (_: string): void => {};
  setItem = (_: string, __: string): void => {};
}

class UndefinedWindow {
  constructor() {}
  public get sessionStorage(): Storage {
    return new MockStorage();
  }
  public get localStorage(): Storage {
    return new MockStorage();
  }
}

class BrowserStorage {
  private static window =
    typeof window === "undefined" ? new UndefinedWindow() : window;

  public static get sessionStorage(): Storage {
    return BrowserStorage.window.sessionStorage;
  }
  public static get localStorage(): Storage {
    return BrowserStorage.window.localStorage;
  }
}

const localSetItem = (key: string, value: string): void =>
  BrowserStorage.localStorage.setItem(key, value);

const localGetItem = (key: string): string | null =>
  BrowserStorage.localStorage.getItem(key);

// // Characters Storage

const storageGetCharacters = (key: string): MutableCharacters => {
  const charactersJSON = localGetItem(key);
  if (charactersJSON === null) return MutableCharacters.newEmpty();
  try {
    const charactersObj = JSON.parse(charactersJSON); // Deserialize JSON
    const characters = MutableCharacters.fromObject({
      characters: charactersObj,
    }); // Validate Object
    return characters;
  } catch (e) {
    throw new Error(`failed to load characters: ${e}`);
  }
};

const CharStorageCache: {
  readonlyCharacters: { [key: string]: ReadonlyCharacters };
  // prevents weird behavior from caching characters while mutating them
  // not a fix, but rather a pre-emptive measure
  context: "readonly" | "mutable" | null;
  // NextJS does not reload the page when navigating to a new page, persisting global state
  path: string | null;
} = {
  context: null,
  path: null,
  readonlyCharacters: {},
};

const charStorageCtxAssert = (
  kind: "readonly" | "mutable",
  path: string
): void => {
  if (CharStorageCache.context === null || CharStorageCache.path !== path) {
    CharStorageCache.context = kind;
    CharStorageCache.path = path;
    CharStorageCache.readonlyCharacters = {};
  } else if (CharStorageCache.context !== kind) {
    throw new Error(
      `cannot use ${kind} characters in ${
        kind === "readonly" ? "mutable" : "readonly"
      } context`
    );
  }
};

// Readonly Context

export const storageGetReadonlyCharacters = (
  _: BrowserContextMarker,
  key: string
): Readonly<Readonly<Character>[]> => {
  charStorageCtxAssert("readonly", window.location.pathname);
  if (CharStorageCache.readonlyCharacters[key] === undefined) {
    CharStorageCache.readonlyCharacters[key] =
      storageGetCharacters(key).characters;
  }
  return CharStorageCache.readonlyCharacters[key];
};

// Mutable Context

export const storageSetCharacters = (
  _: BrowserContextMarker,
  key: string,
  characters: ReadonlyCharacters[] | Character[]
): void => {
  charStorageCtxAssert("mutable", window.location.pathname);
  localSetItem(key, JSON.stringify(characters));
};

export const storageGetMutableCharacters = (
  _: BrowserContextMarker,
  key: string
): MutableCharacters => {
  charStorageCtxAssert("mutable", window.location.pathname);
  return storageGetCharacters(key);
};

// // Shop Parse Storage

const SHOP_PARSE_KEY = "shopParseText";

export const storageGetShopParseText = (
  _: BrowserContextMarker,
  sessionKey: string,
  locationId: string
): string | null => {
  if (!sessionKey || !locationId) return null;

  const raw = localGetItem(SHOP_PARSE_KEY);
  if (!raw) return null;

  const obj: unknown = JSON.parse(raw);
  if (
    !obj ||
    typeof obj !== "object" ||
    !("sessionKey" in obj) ||
    obj.sessionKey !== sessionKey ||
    !("locationId" in obj) ||
    obj.locationId !== locationId ||
    !("text" in obj) ||
    typeof obj.text !== "string"
  ) {
    return null;
  }

  return obj.text;
};

export const storageSetShopParseText = (
  _: BrowserContextMarker,
  shopParseText: ShopParseText
): void => localSetItem(SHOP_PARSE_KEY, JSON.stringify(shopParseText));
