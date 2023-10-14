"use client";

import { ICharacter } from "@/browser/character";
import { BasicItem, MakePurchaseStatus, TypeNamingLists } from "@/proto/etco";
import { ReactElement, ReactNode, Suspense, useState } from "react";
import {
  ShopAppraisalContainer,
  ShopAppraisalContainerProps,
} from "../Appraisal/ShopAppraisalContainer";
import { useAppraisalCodeURIEffect } from "../Appraisal/useAppraisalCode";
import { Loading } from "../Loading";
import { ContentPortal } from "../Content";
import { useServerAction } from "@/server-actions/util";
import { ErrorBoundaryGoBack, ErrorBoundaryTryAgain } from "../ErrorBoundary";
import { ParsedJSONError } from "@/error/error";
import { newAppraisalContainerChildren } from "../Appraisal/ContainerChildren";
import { Appraisal } from "@/server-actions/grpc/appraisal";
import { ShopInventory } from "./Inventory";
import { ValidShopItem } from "@/server-actions/grpc/other";
import {
  MakePurchaseAppraisal,
  resultShopMakePurchase,
  shopMakePurchase,
} from "@/server-actions/grpc/appraisalNew";
import { Result } from "../todo";

export interface PurchaseContainerProps
  extends Omit<ShopAppraisalContainerProps, "containerChildren"> {
  typeNamingLists: TypeNamingLists;
  items: ValidShopItem[];
  character: ICharacter;
  locationId: number;
}
export const PurchaseContainer = ({
  typeNamingLists,
  items,
  character,
  locationId,
  ...appraisalProps
}: PurchaseContainerProps): ReactElement => {
  const [checkout, setCheckout] = useState<
    | {
        checkingOut: true;
        items: BasicItem[];
      }
    | { checkingOut: false }
  >({ checkingOut: false });

  const actionMakePurchase = (
    items: BasicItem[]
  ): Promise<Result<MakePurchaseAppraisal, unknown>> =>
    resultShopMakePurchase(locationId, items, character);

  if (checkout.checkingOut) {
    return (
      <Suspense
        fallback={
          <ContentPortal>
            <Loading scale="25%" />
          </ContentPortal>
        }
      >
        <ErrorBoundaryTryAgain>
          <MakePurchase
            actionMakePurchase={() => actionMakePurchase(checkout.items)}
          >
            {({ rep: { appraisal, makePurchaseStatus: status } }) => (
              <ErrorBoundaryGoBack href={`/shop/inventory/${locationId}`}>
                <PurchaseResult
                  appraisal={appraisal}
                  status={status}
                  {...appraisalProps}
                />
              </ErrorBoundaryGoBack>
            )}
          </MakePurchase>
        </ErrorBoundaryTryAgain>
      </Suspense>
    );
  } else {
    return (
      <ShopInventory
        items={items}
        typeNamingLists={typeNamingLists}
        onCheckout={(items) => setCheckout({ checkingOut: true, items })}
        {...appraisalProps}
      />
    );
  }
};

interface MakePurchaseProps {
  actionMakePurchase: () => Promise<Result<MakePurchaseAppraisal, unknown>>;
  children?: (args: { rep: MakePurchaseAppraisal }) => ReactNode;
}
const MakePurchase = ({
  actionMakePurchase,
  children,
}: MakePurchaseProps): ReactElement => {
  const rep = useServerAction(actionMakePurchase);
  if (rep.some) {
    return <>{children && children({ rep: rep.value })}</>;
  } else {
    return <></>;
  }
};

interface PurchaseResultProps
  extends Omit<ShopAppraisalContainerProps, "containerChildren"> {
  appraisal?: Appraisal;
  status: MakePurchaseStatus;
}
const PurchaseResult = ({
  appraisal,
  status,
  ...appraisalProps
}: PurchaseResultProps): ReactElement => {
  const appraisalOk =
    appraisal !== undefined && status === MakePurchaseStatus.MPS_SUCCESS;
  useAppraisalCodeURIEffect("/shop", appraisalOk ? appraisal.code : null);

  if (!appraisalOk) {
    let message: string;
    switch (status) {
      case MakePurchaseStatus.MPS_SUCCESS:
        message = "SERVER ERROR: Purchase successful, appraisal undefined.";
        break;
      case MakePurchaseStatus.MPS_COOLDOWN_LIMIT:
        message =
          "You are on cooldown, please wait before making another purchase.";
        break;
      case MakePurchaseStatus.MPS_MAX_ACTIVE_LIMIT:
        message = "You have reached the maximum number of active purchases.";
        break;
      case MakePurchaseStatus.MPS_ITEMS_REJECTED:
        message = "Some of the items probably have no market orders.";
        break;
      case MakePurchaseStatus.MPS_ITEMS_UNAVAILABLE:
        message =
          "Some of the items are unavailable - they may have been sold or moved.";
        break;
      case MakePurchaseStatus.MPS_ITEMS_REJECTED_AND_UNAVAILABLE:
        message =
          "Some of the items probably have no market orders, and some of the items are unavailable - they may have been sold or moved.";
        break;
    }
    throw new ParsedJSONError({
      kind: ["MakePurchaseStatus"],
      status: MakePurchaseStatus[status],
      appraisal: appraisal
        ? JSON.stringify(appraisal.items, null, 2)
        : "undefined",
      message,
    });
  } else {
    return (
      <ShopAppraisalContainer
        containerChildren={newAppraisalContainerChildren(appraisal)}
        {...appraisalProps}
      />
    );
  }
};
