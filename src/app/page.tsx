import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { Main } from "@/components/Main";
import { UserQueueLoader } from "@/components/Queue/Loader";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ReactElement, Suspense } from "react";

const PATH = "/";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <Main path={PATH} character={character}>
      {character && (
        <Suspense fallback={<Loading scale="25%" />}>
          <ErrorBoundaryRefresh>
            <UserQueueLoader token={character.refreshToken} />
          </ErrorBoundaryRefresh>
        </Suspense>
      )}
    </Main>
  );
}
