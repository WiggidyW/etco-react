import { ReactElement, useState, useEffect } from "react";
import { jsonOrStatusError } from "@/utils/fetchUtil";

interface IEntityName {
  name: string;
}

class EntityName implements IEntityName {
  constructor(public readonly name: string) {}

  static fromObject = ({ name }: any | IEntityName): EntityName => {
    const invalid = (): never => { throw new Error("invalid entity name"); }; //prettier-ignore
    if (typeof name !== "string") return invalid();
    return new EntityName(name);
  };
}

const NameFetched = ({
  queryId,
  queryEntity,
}: {
  queryId: number;
  queryEntity: string;
}): ReactElement => {
  const [name, setName] = useState<string>(queryId.toString());
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://esi.evetech.net/latest/${queryEntity}/${queryId}`
      );
      const data = await jsonOrStatusError(res, `${queryEntity}/${queryId}`);
      const entityName = EntityName.fromObject(data);
      setName(entityName.name);
    })();
  }, [queryId]);
  return <>{name}</>;
};

export const CharacterNameFetched = ({
  characterId,
}: {
  characterId: number;
}): ReactElement => (
  <NameFetched queryId={characterId} queryEntity={"characters"} />
);

export const CorporationNameFetched = ({
  corporationId,
}: {
  corporationId: number;
}): ReactElement => (
  <NameFetched queryId={corporationId} queryEntity={"corporations"} />
);

export const AllianceNameFetched = ({
  allianceId,
}: {
  allianceId: number;
}): ReactElement => (
  <NameFetched queryId={allianceId} queryEntity={"alliances"} />
);
