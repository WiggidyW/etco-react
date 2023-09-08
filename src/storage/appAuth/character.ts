// Singleton CurrentCharacter

import { EveAppKind } from "@/eveapps";
import {
  Character,
  currentCharacterKey,
  delCurrentCharacter,
  loadCurrentCharacter,
  setCurrentCharacter,
} from "../character";

export class CurrentCharacterManager {
  private static currentCharacter: Character | null | undefined = undefined;
  private static key: string = currentCharacterKey(EveAppKind.Auth);

  public static getCurrentCharacter(): Character | null {
    if (CurrentCharacterManager.currentCharacter === undefined) {
      CurrentCharacterManager.currentCharacter = loadCurrentCharacter(
        CurrentCharacterManager.key
      );
    }
    return CurrentCharacterManager.currentCharacter;
  }

  public static setCurrentCharacter(character: Character): void {
    CurrentCharacterManager.currentCharacter = character;
    setCurrentCharacter(CurrentCharacterManager.key, character);
  }

  public static delCurrentCharacter(): void {
    CurrentCharacterManager.currentCharacter = null;
    delCurrentCharacter(CurrentCharacterManager.key);
  }
}
