import { AdminMain } from "@/components/Main";
import { ReactElement, Suspense } from "react";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { ContractQueueLoader } from "@/components/Queue/Loader";
import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";

const PATH = "/admin/queue/shop-contracts";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <Suspense fallback={<Loading scale="25%" />}>
          <ErrorBoundaryRefresh>
            <ContractQueueLoader kind="shop" token={character.refreshToken} />
          </ErrorBoundaryRefresh>
        </Suspense>
      )}
    </AdminMain>
  );
}
