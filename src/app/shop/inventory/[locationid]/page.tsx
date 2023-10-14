import { PurchaseContainerLoader } from "@/components/Purchase/Loader";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { getLocations } from "@/components/Appraisal/Options";
import { isLocationIdStringValid } from "@/utils/locationId";
import { LoggedInMain } from "@/components/Main";
import { Loading } from "@/components/Loading";
import { ReactElement, Suspense } from "react";
import { redirect } from "next/navigation";

const REDIRECT_PATH = "/shop";
const BASE_PATH = "/shop/inventory";

export default function Page({
  params: { locationid },
}: {
  params: { locationid: string };
}): ReactElement {
  console.log("locationId", locationid);
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  if (isLocationIdStringValid(locationid)) {
    return (
      <LoggedInMain path={`${BASE_PATH}/${locationid}`} character={character}>
        {character && (
          <Suspense fallback={<Loading scale="25%" />}>
            <ErrorBoundaryRefresh>
              <PurchaseContainerLoader
                character={character!}
                locationId={Number(locationid)}
                options={getLocations()}
              />
            </ErrorBoundaryRefresh>
          </Suspense>
        )}
      </LoggedInMain>
    );
  } else {
    return redirect(REDIRECT_PATH);
  }
}
