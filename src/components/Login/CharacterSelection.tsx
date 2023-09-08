import { ReactElement } from "react";
import { CharacterCard } from "./CharacterCard";
import { Character } from "@/storage/character";

export interface CharacterSelectionProps {
  characters: Character[];
  loginUrl: string;
  onLogout: (index: number) => void;
  onSelect?: (index: number) => void;
}

export const CharacterSelection = ({
  characters,
  loginUrl,
  onSelect,
  onLogout,
}: CharacterSelectionProps): ReactElement => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-full max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Character Selection</h1>
        <a className="px-4 py-2 bg-blue-500 text-white rounded" href={loginUrl}>
          New
        </a>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {characters.map((character, i) => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={onSelect ? () => onSelect(i) : undefined}
            onLogout={() => onLogout(i)}
          />
        ))}
      </div>
    </div>
  </div>
);
