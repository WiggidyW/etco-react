"use client";

import { ICharacter } from "@/browser/character";
import { BasicItem, MakePurchaseStatus, ShopItem } from "@/proto/etco";
import { ReactElement, ReactNode, Suspense, useState } from "react";
import {
  ShopAppraisalContainer,
  ShopAppraisalContainerProps,
} from "../ShopAppraisalContainer";
import { useAppraisalCodeURIEffect } from "../useAppraisalCode";
import { Loading } from "../../Loading";
import { ContentPortal } from "../../Content";
import { useServerAction } from "@/server-actions/util";
import {
  ErrorBoundaryGoBack,
  ErrorBoundaryTryAgain,
} from "../../ErrorBoundary";
import { ParsedJSONError } from "@/error/error";
import { newAppraisalContainerChildren } from "../ContainerChildren";
import { Appraisal } from "@/server-actions/grpc/appraisal";
import { ShopInventory } from "./Inventory";
import {
  MakePurchaseAppraisal,
  resultShopMakePurchase,
  shopMakePurchase,
} from "@/server-actions/grpc/appraisalNew";
import { Result } from "../../todo";

export interface BasePurchaseContainerProps {
  strs: string[];
  items: ShopItem[];
  character: ICharacter;
  locationId: number;
}

export type PurchaseContainerProps = BasePurchaseContainerProps &
  Omit<ShopAppraisalContainerProps, "containerChildren">;
export const PurchaseContainer = ({
  strs,
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
                  character={character}
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
        strs={strs}
        items={items}
        locationId={locationId}
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
  character: ICharacter;
  status: MakePurchaseStatus;
}
const PurchaseResult = ({
  appraisal,
  status,
  character,
  ...appraisalProps
}: PurchaseResultProps): ReactElement => {
  const appraisalOk =
    appraisal !== undefined &&
    (status === MakePurchaseStatus.MPS_SUCCESS ||
      status === MakePurchaseStatus.MPS_NONE);
  useAppraisalCodeURIEffect("/shop", appraisalOk ? appraisal.code : null);

  if (!appraisalOk) {
    let message: string;
    switch (status) {
      case MakePurchaseStatus.MPS_SUCCESS:
      case MakePurchaseStatus.MPS_NONE:
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
        containerChildren={newAppraisalContainerChildren(appraisal, character)}
        {...appraisalProps}
      />
    );
  }
};
