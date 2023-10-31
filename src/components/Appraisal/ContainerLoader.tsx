import { ICharacter } from "@/browser/character";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { notFound } from "next/navigation";
import { ReactElement } from "react";
import { newAppraisalContainerChildren } from "./ContainerChildren";
import { ErrorBoundaryTryAgain } from "../ErrorBoundary";
import { ShopAppraisalContainer } from "./ShopAppraisalContainer";
import { BuybackAppraisalContainer } from "./BuybackAppraisalContainer";
import {
  resultGetBuybackAppraisal,
  resultGetShopAppraisal,
} from "@/server-actions/grpc/appraisalGet";
import { ErrorThrower } from "../ErrorThrower";

export interface AppraisalContainerLoaderProps {
  character?: ICharacter;
  code: string;
  kind: StoreKind;
  options: { label: string; value: string }[];
}
export const AppraisalContainerLoader = async ({
  character,
  code,
  kind,
  options,
}: AppraisalContainerLoaderProps): Promise<ReactElement> => {
  const appraisalResult =
    kind === "buyback"
      ? await resultGetBuybackAppraisal(code, character)
      : await resultGetShopAppraisal(code, character);

  if (!appraisalResult.ok) {
    return <ErrorThrower error={appraisalResult.error} />; // throw error on client
  }

  const appraisal = appraisalResult.value;
  let defaultOption: { label: string; value: string } | undefined = undefined;

  if (appraisal === null) {
    return notFound();
  } else if (kind === "shop") {
    if (appraisal.locationId) {
      defaultOption = options.find(
        (option) => option.value === appraisal.locationId!.toString()
      );
    }
    return (
      <ErrorBoundaryTryAgain>
        <ShopAppraisalContainer
          options={options}
          character={character}
          containerChildren={newAppraisalContainerChildren(appraisal)}
          defaultOption={defaultOption}
        />
      </ErrorBoundaryTryAgain>
    );
  } /* else if (kind === "buyback") */ else {
    defaultOption = options.find(
      (option) => option.value === appraisal.systemId.toString()
    );
    return (
      <ErrorBoundaryTryAgain>
        <BuybackAppraisalContainer
          options={options}
          character={character}
          containerChildren={newAppraisalContainerChildren(appraisal)}
          defaultOption={defaultOption}
        />
      </ErrorBoundaryTryAgain>
    );
  }
};
