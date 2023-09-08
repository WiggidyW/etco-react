import { EveAppKind, getEveApp } from "@/eveapps";
import { Character, ICharacter } from "./character";

export interface ICharacters {
  characters: ICharacter[];
}

export class Characters implements ICharacters {
  private constructor(public characters: Character[]) {}

  static fromObject = ({ characters }: any | ICharacters): Characters => {
    const invalid = (): never => {
      throw new Error("invalid characters");
    };
    if (!Array.isArray(characters)) return invalid();
    return new Characters(characters.map((c) => Character.fromObject(c)));
  };

  addCharacter = (character: Character): void => {
    const exists = this.characters.findIndex((c) => c.id === character.id);
    if (exists !== -1) {
      this.characters[exists] = character;
    } else {
      this.characters.push(character);
    }
  };

  delCharacter = (index: number): void => {
    this.characters.splice(index, 1);
  };
}

export const storageCharactersKey = (eveAppKind: EveAppKind): string =>
  getEveApp(eveAppKind).charactersKey;

export const storageLoadCharacters = (key: string): Characters => {
  const charactersJSON = window.localStorage.getItem(key);
  if (charactersJSON === null) return Characters.fromObject({ characters: [] });
  try {
    const charactersObj = JSON.parse(charactersJSON); // Deserialize JSON
    const characters = Characters.fromObject(charactersObj); // Validate Object
    return characters;
  } catch (e) {
    throw new Error(`failed to load characters: ${e}`);
  }
};

export const storageSetCharacters = (
  key: string,
  characters: Characters
): void => window!.localStorage.setItem(key, JSON.stringify(characters));
