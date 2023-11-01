import { ShopAppraisalContainer } from "@/components/Appraisal/ShopAppraisalContainer";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ErrorBoundaryTryAgain } from "@/components/ErrorBoundary";
import { getLocations } from "@/components/Appraisal/Options";
import { Main } from "@/components/Main";
import { ReactElement } from "react";

const PATH = "/shop";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  return (
    <Main path={PATH} character={character}>
      <ErrorBoundaryTryAgain>
        <ShopAppraisalContainer options={getLocations()} />
      </ErrorBoundaryTryAgain>
    </Main>
  );
}
