import { BasicItem } from "@/proto/etco";
import { Record } from "./ItemRecord";
import { ReactElement } from "react";
import { ContentPortal } from "@/components/Content";
import { Popup } from "@/components/Popup";
import { Button } from "@/components/Input/Manipulator";
import classNames from "classnames";
import {
  AppraisalTable,
  AppraisalTablePartialAppraisal,
} from "@/components/Appraisal/Table/Table";
import { AppraisalItem } from "@/server-actions/grpc/appraisal";

export interface CartInfo {
  price: number;
  quantity: number;
}

export interface CartProps {
  records: Record[];
  price: number;
  onCheckout: (items: BasicItem[]) => void;
  onCancel: () => void;
}
export const Cart = ({
  records,
  price,
  onCheckout,
  onCancel,
}: CartProps): ReactElement => {
  const appraisal = newCartAppraisal(records, price);
  return (
    <ContentPortal>
      <Popup
        onClickOutside={onCancel}
        percentage={"85"}
        footer={
          <>
            <Button
              className={classNames("p-1", "ml-1")}
              variant="failure"
              onClick={onCancel}
              noPad
            >
              Cancel
            </Button>
            <Button
              className={classNames("p-1", "ml-auto", "mr-1")}
              variant="success"
              onClick={() => onCheckout(appraisal.items)}
              noPad
            >
              Checkout
            </Button>
          </>
        }
        footerClassName={classNames("flex")}
      >
        <AppraisalTable appraisal={appraisal} time={false} version={false} />
      </Popup>
    </ContentPortal>
  );
};

const newCartAppraisal = (
  records: Record[],
  price: number
): AppraisalTablePartialAppraisal => ({
  price,
  newPrice: true,
  time: Date.now() / 1000,
  newTime: true,
  version: "Cart",
  newVersion: true,
  items: newCartAppraisalItems(records),
  status: null,
});

const newCartAppraisalItems = (records: Record[]): AppraisalItem[] => {
  const items: AppraisalItem[] = [];
  for (const {
    typeId,
    typeName,
    pricePerUnit,
    description,
    cartQuantity,
  } of records) {
    if (cartQuantity ?? 0 > 0) {
      items.push({
        typeId,
        name: typeName,
        pricePerUnit,
        newPricePerUnit: true,
        description,
        newDescription: true,
        quantity: cartQuantity ?? 0,
        contractQuantity: true,
        children: [],
      });
    }
  }
  return items;
};
