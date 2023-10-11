import { ReactElement } from "react";
import { AppraisalProps } from "./ContractInfo";
import { InfoRow, InfoTable, PortraitRow } from "./Shared";

export const AppraisalPrimaryInfo = ({
  className,
  appraisal: {
    locationId,
    systemId,
    regionId,
    code,
    character,
    status,
    locationNamingMaps: { locationNames, systemNames, regionNames },
  },
}: AppraisalProps): ReactElement => {
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
    </InfoTable>
  );
};
