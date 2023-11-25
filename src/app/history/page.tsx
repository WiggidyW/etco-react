import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { LoggedInMain, Main } from "@/components/Main";
import { UserQueueLoader } from "@/components/Queue/Loader";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ReactElement, Suspense } from "react";

const PATH = "/history";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter()?.toObject();
  return (
    <LoggedInMain path={PATH} character={character}>
      {character && (
        <Suspense fallback={<Loading scale="25%" />}>
          <ErrorBoundaryRefresh>
            <UserQueueLoader character={character} />
          </ErrorBoundaryRefresh>
        </Suspense>
      )}
    </LoggedInMain>
  );
}
