import { ContentPortal } from "@/components/Content";
import { Popup } from "@/components/Popup";
import { ShopAppraisal } from "@/server-actions/grpc/appraisal";
import { ReactElement } from "react";
import { AppraisalTable } from "../Table/Table";
import { Button } from "@/components/Input/Manipulator";
import classNames from "classnames";

export interface ConfirmParseProps {
  parsed: ShopAppraisal;
  onConfirm: (parsed: ShopAppraisal) => void;
  onCancel: () => void;
}
export const ConfirmParse = ({
  parsed,
  onConfirm,
  onCancel,
}: ConfirmParseProps): ReactElement => (
  <ContentPortal>
    <Popup
      onClickOutside={onCancel}
      percentage="85"
      footer={
        <>
          <Button
            className={classNames("p-1", "ml-1")}
            variant="failure"
            onClick={onCancel}
            noPad
          >
            Reject
          </Button>
          <Button
            className={classNames("p-1", "ml-auto", "mr-1")}
            variant="success"
            onClick={() => onConfirm(parsed)}
            noPad
          >
            Confirm
          </Button>
        </>
      }
      footerClassName={classNames("flex")}
    >
      <AppraisalTable
        appraisal={parsed}
        time={false}
        version={false}
        priceHeadVals={["Before", "After"]}
        priceTotalHeadVals={["Parsed", "Available"]}
        contractQuantityHeadVals={["Parsed", "Available"]}
        forceNewQuantityCheck
        useNewQuantityPrice
      />
    </Popup>
  </ContentPortal>
);
