import { AdminMain } from "@/components/Main";
import { ReactElement, Suspense } from "react";
import { serverCookiesGetCurrentCharacter } from "@/cookies/server";
import { PurchaseQueueLoader } from "@/components/Queue/Loader";
import { ErrorBoundaryRefresh } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";

const PATH = "/admin/queue/shop-purchase";

export default function Page(): ReactElement {
  const character = serverCookiesGetCurrentCharacter();
  return (
    <AdminMain path={PATH} character={character}>
      {character && (
        <Suspense fallback={<Loading scale="25%" />}>
          <ErrorBoundaryRefresh>
            <PurchaseQueueLoader token={character.refreshToken} />
          </ErrorBoundaryRefresh>
        </Suspense>
      )}
    </AdminMain>
  );
}
