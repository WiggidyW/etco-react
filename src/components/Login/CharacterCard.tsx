import { ReactElement } from "react";
import {
  AlliancePortrait,
  CharacterPortrait,
  CorporationPortrait,
} from "./EntityPortrait";
import { Character } from "@/storage/character";

export interface CharacterCardProps {
  character: Character;
  onLogout: () => void;
  onSelect?: () => void;
}

export const CharacterCard = ({
  character,
  onLogout,
  onSelect,
}: CharacterCardProps): ReactElement => (
  <div className="rounded-lg shadow p-4 max-w-sm">
    <div className="mb-4 flex justify-center">
      <CharacterPortrait
        queryId={character.id}
        querySize={256}
        className="w-24 h-24 rounded-full"
      />
      <CorporationPortrait
        queryId={character.corporationId}
        querySize={256}
        className="w-12 h-12 rounded-full mx-2"
      />
      <AlliancePortrait
        queryId={character.allianceId}
        querySize={256}
        className="w-12 h-12 rounded-full"
      />
    </div>
    <h2 className="text-xl font-semibold mb-2">{character.name}</h2>
    <button
      className="mr-2 px-4 py-2 border rounded border-gray-400"
      onClick={onLogout}
    >
      Logout
    </button>
    {onSelect && (
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={onSelect}
      >
        Select
      </button>
    )}
  </div>
);
