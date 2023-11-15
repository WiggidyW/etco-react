import { ReactElement } from "react";
import { AppraisalProps } from "./ContractInfo";
import { InfoRow, InfoTable, PortraitRow } from "./Shared";
import { ICharacter } from "@/browser/character";
import { CancelButton } from "./Cancel";

export interface AppraisalPrimaryInfoProps extends AppraisalProps {
  character?: ICharacter;
}

export const AppraisalPrimaryInfo = ({
  className,
  character: loginCharacter,
  appraisal: {
    locationId,
    systemId,
    regionId,
    code,
    character,
    status,
    locationNamingMaps: { locationNames, systemNames, regionNames },
  },
}: AppraisalPrimaryInfoProps): ReactElement => {
  let statusString: string;
  if (character === undefined) {
    statusString = "Anonymous";
  } else if (status === null) {
    statusString = "Undefined";
  } else if (status === "inPurchaseQueue") {
    statusString = "In Purchase Queue";
  } else {
    statusString = "Contracted";
  }

  return (
    <InfoTable className={className}>
      {character && <PortraitRow entity={character} />}
      {locationId && (
        <InfoRow label="Location">{locationNames[locationId]}</InfoRow>
      )}
      <InfoRow label="System">{systemNames[systemId]}</InfoRow>
      <InfoRow label="Region">{regionNames[regionId]}</InfoRow>
      <InfoRow label="Status">{statusString}</InfoRow>
      <InfoRow label="Code">{code}</InfoRow>
      {status === "inPurchaseQueue" && loginCharacter && (
        <CancelButton character={loginCharacter} code={code} />
      )}
    </InfoTable>
  );
};
