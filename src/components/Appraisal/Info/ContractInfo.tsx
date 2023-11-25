import { ReactNode } from "react";
import { ContractStatus } from "@/proto/etco";
import { LocaleText, formatPrice, formatTime } from "../Util";
import { Appraisal } from "@/server-actions/grpc/appraisal";
import { InfoRow, InfoTable, PortraitRow } from "./Shared";

export interface AppraisalProps {
  className?: string;
  appraisal: Appraisal;
}

export const AppraisalContractInfo = ({
  className,
  appraisal,
}: AppraisalProps): ReactNode => {
  if (appraisal.status === null || appraisal.status === "inPurchaseQueue") {
    if (appraisal.character === undefined) {
      return null;
    } else {
      return (
        <InfoTable>
          <tr>
            <td>No Contract</td>
          </tr>
        </InfoTable>
      );
    }
  }

  const {
    contract: {
      status: pbContractStatus,
      issued,
      expires,
      /* Start Extra-Disgusting Code */
      locationInfo: {
        locationStrIndex,
        systemInfo: { systemStrIndex, regionStrIndex } = {
          systemStrIndex: 0,
          regionStrIndex: 0,
        },
      } = {
        locationStrIndex: 0,
      },
      /* End Extra-Disgusting Code */
      price,
    },
    strs,
    entity: { entity },
  } = appraisal.status;

  const locationName = strs[locationStrIndex];
  const systemName = strs[systemStrIndex];
  const regionName = strs[regionStrIndex];

  return (
    <InfoTable className={className}>
      <PortraitRow entity={entity} />
      <InfoRow label="Price">
        <LocaleText fmt={formatPrice} v={price} />
      </InfoRow>
      <InfoRow label="Location">{locationName}</InfoRow>
      <InfoRow label="System">{systemName}</InfoRow>
      <InfoRow label="Region">{regionName}</InfoRow>
      <InfoRow label="Issued">
        <LocaleText fmt={formatTime} v={issued} />
      </InfoRow>
      <InfoRow label="Expires">
        <LocaleText fmt={formatTime} v={expires} />
      </InfoRow>
      <InfoRow label="Status">{ContractStatus[pbContractStatus]}</InfoRow>
    </InfoTable>
  );
};
