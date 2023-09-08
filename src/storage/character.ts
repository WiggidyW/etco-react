import { EveAppKind, getEveApp } from "@/eveapps";

export interface ICharacter {
  name: string;
  id: number;
  admin: boolean;
  corporationId: number;
  allianceId?: number;
}

export class Character implements ICharacter {
  private constructor(
    readonly name: string,
    readonly id: number,
    readonly admin: boolean,
    readonly corporationId: number,
    readonly allianceId?: number
  ) {}

  static fromObject({
    name,
    id,
    admin,
    corporationId,
    allianceId,
  }: any | ICharacter): Character {
    const invalid = (): never => {
      throw new Error("invalid character");
    };
    if (typeof name !== "string") return invalid();
    if (typeof id !== "number") return invalid();
    if (typeof admin !== "boolean") return invalid();
    if (typeof corporationId !== "number") return invalid();
    if (allianceId !== undefined && typeof allianceId !== "number")
      return invalid();
    return new Character(name, id, admin, corporationId, allianceId);
  }
}

export const currentCharacterKey = (eveAppKind: EveAppKind): string =>
  getEveApp(eveAppKind).currentCharacterKey;

export const loadCurrentCharacter = (key: string): Character | null => {
  const currentCharacterJSON = window!.localStorage.getItem(key);
  if (currentCharacterJSON === null) return null;
  try {
    const currentCharacterObj = JSON.parse(currentCharacterJSON); // Deserialize JSON
    const currentCharacter = Character.fromObject(currentCharacterObj); // Validate Object
    return currentCharacter;
  } catch (e) {
    throw new Error(`failed to load current character: ${e}`);
  }
};

export const setCurrentCharacter = (key: string, character: Character): void =>
  window!.localStorage.setItem(key, JSON.stringify(character));

export const delCurrentCharacter = (key: string): void =>
  window!.localStorage.removeItem(key);
