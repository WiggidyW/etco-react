import { ShopAppraisalContainer } from "@/components/Appraisal/ShopAppraisalContainer";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ErrorBoundaryTryAgain } from "@/components/ErrorBoundary";
import { getLocations } from "@/components/Appraisal/Options";
import { Main } from "@/components/Main";
import { ReactElement } from "react";
import { redirect } from "next/navigation";

const PATH = "/shop";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  const locations = getLocations();
  if (locations.length === 1) {
    return redirect(`${PATH}/inventory/${locations[0].value}`);
  } else {
    return (
      <Main path={PATH} character={character}>
        <ErrorBoundaryTryAgain>
          <ShopAppraisalContainer options={locations} />
        </ErrorBoundaryTryAgain>
      </Main>
    );
  }
}
