import { ShopAppraisalContainer } from "@/components/Appraisal/ShopAppraisalContainer";
import { PurchaseContainerLoader } from "@/components/Purchase/Loader";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { getLocations } from "@/components/Appraisal/Options";
import { isLocationIdStringValid } from "@/utils/locationId";
import { LoggedInMain, Main } from "@/components/Main";
import { redirect } from "next/navigation";
import { ReactElement, Suspense } from "react";
import {
  ErrorBoundaryRefresh,
  ErrorBoundaryTryAgain,
} from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";

const PATH = "/shop";

export default function Page({
  searchParams: { locationId },
}: {
  searchParams: { locationId?: string | string[] };
}): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  if (!isLocationIdParamValid(locationId)) {
    return redirect(PATH);
  } else if (locationId) {
    return (
      <LoggedInMain path={`${PATH}`} character={character}>
        {character && (
          <Suspense fallback={<Loading scale="25%" />}>
            <ErrorBoundaryRefresh>
              <PurchaseContainerLoader
                character={character!}
                locationId={Number(locationId)}
                options={getLocations()}
                basePath={PATH}
              />
            </ErrorBoundaryRefresh>
          </Suspense>
        )}
      </LoggedInMain>
    );
  } /* if (!locationId) */ else {
    return (
      <Main path={PATH} character={character}>
        <ErrorBoundaryTryAgain>
          <ShopAppraisalContainer
            basePath={`${PATH}`}
            options={getLocations()}
          />
        </ErrorBoundaryTryAgain>
      </Main>
    );
  }
}

const isLocationIdParamValid = (locationId?: string | string[]): boolean => {
  if (locationId === undefined) return true;
  if (typeof locationId !== "string") return false;
  return isLocationIdStringValid(locationId);
};
