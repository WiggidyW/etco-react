import { ICharacter } from "@/browser/character";
import { ReactElement } from "react";
import { PurchaseContainer } from "./Container";
import { ShopAppraisalContainerProps } from "../ShopAppraisalContainer";
import { resultShopInventory } from "@/server-actions/grpc/other";
import { ErrorThrower } from "../../ErrorThrower";

export interface PurchaseContainerLoaderProps
  extends Omit<ShopAppraisalContainerProps, "containerChildren"> {
  character: ICharacter;
  locationId: number;
}
export const PurchaseContainerLoader = async ({
  character,
  locationId,
  options,
  ...appraisalProps
}: PurchaseContainerLoaderProps): Promise<ReactElement> => {
  const inventoryResultPromise = resultShopInventory(
    locationId,
    character.refreshToken
  );
  const defaultOption = options.find(
    (option) => option.value === locationId.toString()
  );
  const inventoryResult = await inventoryResultPromise;
  if (inventoryResult.ok) {
    return (
      <PurchaseContainer
        {...appraisalProps}
        items={inventoryResult.value.items}
        typeNamingLists={inventoryResult.value.typeNamingLists}
        character={character}
        locationId={locationId}
        defaultOption={defaultOption}
        options={options}
      />
    );
  } else {
    return <ErrorThrower error={inventoryResult.error} />; // throw error on client
  }
};
