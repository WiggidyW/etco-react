import { Character, ICharacter } from "./character";

export type ReadonlyCharacters = Readonly<Readonly<Character>[]>;

export interface IMutableCharacters {
  characters: ICharacter[];
}

export class MutableCharacters implements IMutableCharacters {
  private constructor(public characters: Character[]) {}

  static fromObject = ({
    characters,
  }: any | IMutableCharacters): MutableCharacters => {
    const invalid = (): never => {
      throw new Error("invalid characters");
    };
    if (!Array.isArray(characters)) return invalid();
    return new MutableCharacters(
      characters.map((c) => Character.fromObject(c))
    );
  };

  static newEmpty = (): MutableCharacters => {
    return new MutableCharacters([]);
  };

  addCharacter = (character: Character): void => {
    const existsIdx = this.characters.findIndex((c) => c.id === character.id);
    if (existsIdx !== -1) {
      this.characters[existsIdx] = character;
    } else {
      this.characters.push(character);
    }
  };

  delCharacter = (index: number): void => {
    this.characters = [
      ...this.characters.slice(0, index),
      ...this.characters.slice(index + 1, this.characters.length),
    ];
  };

  // TODO: make this a deep clone (or not, what do people prefer?)
  shallowClone = (): MutableCharacters => {
    return new MutableCharacters(this.characters);
  };
}
