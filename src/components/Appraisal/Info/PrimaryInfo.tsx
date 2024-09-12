import { ReactElement } from "react";
import { AppraisalProps } from "./ContractInfo";
import { InfoRow, InfoTable, PortraitRow, TitleRow } from "./Shared";
import { ICharacter } from "@/browser/character";
import { CancelButton } from "./Cancel";
import { PUBLIC_ENV } from "@/env/public";

export interface AppraisalPrimaryInfoProps extends AppraisalProps {
  character?: ICharacter;
}

export const AppraisalPrimaryInfo = ({
  className,
  character: loginCharacter,
  appraisal: {
    locationInfo: { locationId, locationStr, systemStr, regionStr },
    code,
    character,
    status,
    kind,
    price,
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
      <TitleRow>Appraisal</TitleRow>
      {character && <PortraitRow entity={character} />}
      {locationId > 0 && <InfoRow label="Location">{locationStr}</InfoRow>}
      <InfoRow label="System">{systemStr}</InfoRow>
      <InfoRow label="Region">{regionStr}</InfoRow>
      <InfoRow label="Status">{statusString}</InfoRow>
      <InfoRow label="Code">{code}</InfoRow>
      <TitleRow />
      <TitleRow />
      <TitleRow />
      <TitleRow />
      <TitleRow>Contract Details</TitleRow>
      {kind === "buyback" && (
        <>
          <InfoRow label="Availability">{PUBLIC_ENV.CORP_NAME}</InfoRow>
          <InfoRow label="I will receive">{Math.floor(price)}</InfoRow>
          <InfoRow label="Description">{code}</InfoRow>
        </>
      )}
      {status === "inPurchaseQueue" && loginCharacter && (
        <CancelButton
          character={loginCharacter}
          code={code}
          locationId={locationId}
        />
      )}
    </InfoTable>
  );
};
