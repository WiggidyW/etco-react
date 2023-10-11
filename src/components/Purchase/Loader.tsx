import { ICharacter } from "@/browser/character";
import { ReactElement } from "react";
import { PurchaseContainer } from "./Container";
import { ShopAppraisalContainerProps } from "../Appraisal/ShopAppraisalContainer";
import { shopInventory } from "@/server-actions/grpc/other";

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
  const { items, typeNamingLists } = await shopInventory(
    locationId,
    character.refreshToken
  );
  return (
    <PurchaseContainer
      {...appraisalProps}
      items={items}
      typeNamingLists={typeNamingLists}
      character={character}
      locationId={locationId}
    />
  );
};
