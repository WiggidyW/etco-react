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

const CharactersStorageContext: { inner: "readonly" | "mutable" | null } = {
  inner: null,
};

const assertOrSetReadonly = (): void => {
  if (CharactersStorageContext.inner === null) {
    CharactersStorageContext.inner = "readonly";
  } else if (CharactersStorageContext.inner === "mutable") {
    throw new Error("cannot use readonly characters in mutable context");
  }
};

const assertOrSetMutable = (): void => {
  if (CharactersStorageContext.inner === null) {
    CharactersStorageContext.inner = "mutable";
  } else if (CharactersStorageContext.inner === "readonly") {
    throw new Error("cannot use mutable characters in readonly context");
  }
};

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

// Readonly Context

const GlobalReadonlyCharacters: { [key: string]: ReadonlyCharacters } = {};

export const storageGetReadonlyCharacters = (
  _: BrowserContextMarker,
  key: string
): Readonly<Readonly<Character>[]> => {
  assertOrSetReadonly();
  if (GlobalReadonlyCharacters[key] === undefined) {
    GlobalReadonlyCharacters[key] = storageGetCharacters(key).characters;
  }
  return GlobalReadonlyCharacters[key];
};

// Mutable Context

export const storageSetCharacters = (
  _: BrowserContextMarker,
  key: string,
  characters: ReadonlyCharacters[] | Character[]
): void => {
  if (CharactersStorageContext.inner === "readonly") {
    throw new Error("cannot set characters in readonly context");
  } else if (CharactersStorageContext.inner === null) {
    CharactersStorageContext.inner = "mutable";
  }
  localSetItem(key, JSON.stringify(characters));
};

export const storageGetMutableCharacters = (
  _: BrowserContextMarker,
  key: string
): MutableCharacters => {
  assertOrSetMutable();
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
