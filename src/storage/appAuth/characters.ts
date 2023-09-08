// Singleton Characters

import { Character, currentCharacterKey } from "@/storage/character";
import {
  storageCharactersKey,
  storageLoadCharacters,
  storageSetCharacters,
} from "@/storage/characters";
import { delToken, tokenKey } from "@/storage/token";
import { Characters } from "@/storage/characters";
import { EveAppKind } from "@/eveapps";
import { CurrentCharacterManager } from "./character";

export class CharactersManager {
  private static characters: Characters | null = null;
  private static key: string = "";

  private constructor() {}

  private static getCharactersWrapper(): Characters {
    if (CharactersManager.characters === null) {
      CharactersManager.key = storageCharactersKey(EveAppKind.Auth);
      CharactersManager.characters = storageLoadCharacters(
        CharactersManager.key
      );
    }
    return CharactersManager.characters;
  }

  public static getCharacters(): Character[] {
    return CharactersManager.getCharactersWrapper().characters;
  }

  public static addCharacter(character: Character): void {
    const characters = CharactersManager.getCharactersWrapper();
    characters.addCharacter(character);
    console.log(CharactersManager.key);
    storageSetCharacters(CharactersManager.key, characters);
  }

  public static delCharacter(index: number): void {
    const characters = CharactersManager.getCharactersWrapper();
    if (index < 0 || index >= characters.characters.length)
      throw new Error("invalid index");
    const characterId = characters.characters[index].id;

    // delete token from native token storage
    delToken(tokenKey(EveAppKind.Auth, characterId));

    // delete current character if it's the same one being deleted from characters
    const currentCharacter = CurrentCharacterManager.getCurrentCharacter();
    if (currentCharacter !== null && characterId === currentCharacter.id)
      CurrentCharacterManager.delCurrentCharacter();

    characters.delCharacter(index);
    storageSetCharacters(CharactersManager.key, characters);
  }

  public static setCurrentCharacter(index: number): void {
    const characters = CharactersManager.getCharactersWrapper();
    if (index < 0 || index >= characters.characters.length)
      throw new Error("invalid index");

    const newCurrentCharacter = characters.characters[index];
    CurrentCharacterManager.setCurrentCharacter(newCurrentCharacter);
  }
}
