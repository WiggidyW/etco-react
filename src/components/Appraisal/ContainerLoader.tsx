import { ICharacter } from "@/browser/character";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { notFound } from "next/navigation";
import { ReactElement } from "react";
import { newAppraisalContainerChildren } from "./ContainerChildren";
import { ErrorBoundaryTryAgain } from "../ErrorBoundary";
import { ShopAppraisalContainer } from "./ShopAppraisalContainer";
import { BuybackAppraisalContainer } from "./BuybackAppraisalContainer";
import {
  getBuybackAppraisal,
  getShopAppraisal,
} from "@/server-actions/grpc/appraisalGet";

export interface AppraisalContainerLoaderProps {
  character?: ICharacter;
  code: string;
  kind: StoreKind;
  basePath: string;
  options: { label: string; value: string }[];
}
export const AppraisalContainerLoader = async ({
  character,
  code,
  kind,
  options,
  basePath,
}: AppraisalContainerLoaderProps): Promise<ReactElement> => {
  const appraisal =
    kind === "buyback"
      ? await getBuybackAppraisal(code, character)
      : await getShopAppraisal(code, character);
  if (appraisal === null) {
    return notFound();
  } else if (kind === "shop") {
    return (
      <ErrorBoundaryTryAgain>
        <ShopAppraisalContainer
          options={options}
          basePath={basePath}
          containerChildren={newAppraisalContainerChildren(appraisal)}
        />
      </ErrorBoundaryTryAgain>
    );
  } else {
    // props.kind === "buyback"
    return (
      <ErrorBoundaryTryAgain>
        <BuybackAppraisalContainer
          options={options}
          basePath={basePath}
          character={character}
          containerChildren={newAppraisalContainerChildren(appraisal)}
        />
      </ErrorBoundaryTryAgain>
    );
  }
};
