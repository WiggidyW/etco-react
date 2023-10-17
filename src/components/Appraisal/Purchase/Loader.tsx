import { ICharacter } from "@/browser/character";
import { ReactElement } from "react";
import { PurchaseContainer } from "./Container";
import { ShopAppraisalContainerProps } from "../ShopAppraisalContainer";
import {
  ShopInventory,
  resultShopInventory,
} from "@/server-actions/grpc/other";
import { ErrorThrower } from "../../ErrorThrower";
import { Result } from "../../todo";

export interface PurchaseContainerLoaderProps
  extends Omit<ShopAppraisalContainerProps, "containerChildren"> {
  character: ICharacter;
  locationId: number;
}
export const PurchaseContainerLoader = async ({
  character,
  locationId,
  ...appraisalProps
}: PurchaseContainerLoaderProps): Promise<ReactElement> => {
  const inventoryResult: Result<ShopInventory, unknown> =
    await resultShopInventory(locationId, character.refreshToken);
  if (inventoryResult.ok) {
    return (
      <PurchaseContainer
        {...appraisalProps}
        items={inventoryResult.value.items}
        typeNamingLists={inventoryResult.value.typeNamingLists}
        character={character}
        locationId={locationId}
      />
    );
  } else {
    return <ErrorThrower error={inventoryResult.error} />; // throw error on client
  }
};
