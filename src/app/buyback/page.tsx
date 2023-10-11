import { BuybackAppraisalContainer } from "@/components/Appraisal/BuybackAppraisalContainer";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { Main } from "@/components/Main";
import { ReactElement } from "react";
import { getSystems } from "@/components/Appraisal/Options";
import { ErrorBoundaryTryAgain } from "@/components/ErrorBoundary";

const PATH = "/buyback";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  return (
    <Main path={PATH} character={character}>
      <ErrorBoundaryTryAgain>
        <BuybackAppraisalContainer
          options={getSystems()}
          basePath={`${PATH}`}
          character={character}
        />
      </ErrorBoundaryTryAgain>
    </Main>
  );
}
