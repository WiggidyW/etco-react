import { Main } from "@/components/Main";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ReactElement, Suspense } from "react";
import { redirect } from "next/navigation";
import { isBuybackAppraisalCodeQuery } from "@/shared/appraisalCode";
import { Loading } from "@/components/Loading";
import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { AppraisalContainerLoader } from "@/components/Appraisal/ContainerLoader";
import { getSystems } from "@/components/Appraisal/Options";

const BASE_PATH = "/buyback";

export default function Page({
  params: { code },
}: {
  params: { code: string };
}): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  if (!isBuybackAppraisalCodeQuery(code)) {
    redirect(BASE_PATH);
  } else {
    return (
      <Main path={`${BASE_PATH}/${code}`} character={character}>
        <Suspense fallback={<Loading scale="25%" />}>
          <ErrorBoundaryRefresh>
            <AppraisalContainerLoader
              options={getSystems()}
              code={code}
              kind="buyback"
              character={character}
            />
          </ErrorBoundaryRefresh>
        </Suspense>
      </Main>
    );
  }
}
