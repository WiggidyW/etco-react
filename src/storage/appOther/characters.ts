// Singleton Characters (apps other than Auth)

import { Character } from "@/storage/character";
import {
  storageCharactersKey,
  storageLoadCharacters,
  storageSetCharacters,
} from "@/storage/characters";
import { delToken, tokenKey } from "@/storage/token";
import { Characters } from "@/storage/characters";
import { AdminEveAppKind, EveAppKind } from "@/eveapps";

class AdminCharacters {
  private characters: Characters | null = null;
  private key: string = "";
  private eveAppKind: EveAppKind;

  constructor(eveAppKind: EveAppKind) {
    this.eveAppKind = eveAppKind;
  }

  private getCharactersWrapper(): Characters {
    if (this.characters === null) {
      this.key = storageCharactersKey(this.eveAppKind);
      this.characters = storageLoadCharacters(this.key);
    }
    return this.characters;
  }

  public getCharacters(): Character[] {
    return this.getCharactersWrapper().characters;
  }

  public addCharacter(character: Character): void {
    const characters = this.getCharactersWrapper();
    characters.addCharacter(character);
    storageSetCharacters(this.key, characters);
  }

  public delCharacter(index: number): void {
    const characters = this.getCharactersWrapper();
    if (index < 0 || index >= characters.characters.length)
      throw new Error("invalid index");
    delToken(tokenKey(this.eveAppKind, characters.characters[index].id));
    characters.delCharacter(index);
    storageSetCharacters(this.key, characters);
  }
}

export class AdminCharactersManager {
  private static corporationInstance: AdminCharacters | null = null;
  private static marketsInstace: AdminCharacters | null = null;
  private static structureInfoInstance: AdminCharacters | null = null;

  private constructor() {}

  public static getCorporationInstance(): AdminCharacters {
    if (AdminCharactersManager.corporationInstance === null) {
      AdminCharactersManager.corporationInstance = new AdminCharacters(
        EveAppKind.Corporation
      );
    }
    return AdminCharactersManager.corporationInstance;
  }

  public static getMarketInstance(): AdminCharacters {
    if (AdminCharactersManager.marketsInstace === null) {
      AdminCharactersManager.marketsInstace = new AdminCharacters(
        EveAppKind.Markets
      );
    }
    return AdminCharactersManager.marketsInstace;
  }

  public static getStructureInfoInstance(): AdminCharacters {
    if (AdminCharactersManager.structureInfoInstance === null) {
      AdminCharactersManager.structureInfoInstance = new AdminCharacters(
        EveAppKind.StructureInfo
      );
    }
    return AdminCharactersManager.structureInfoInstance;
  }

  public static getInstance(app: AdminEveAppKind): AdminCharacters {
    switch (app) {
      case EveAppKind.Corporation:
        return AdminCharactersManager.getCorporationInstance();
      case EveAppKind.Markets:
        return AdminCharactersManager.getMarketInstance();
      case EveAppKind.StructureInfo:
        return AdminCharactersManager.getStructureInfoInstance();
    }
  }
}
