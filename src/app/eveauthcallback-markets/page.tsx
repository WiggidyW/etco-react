import { EveAuthCallback } from "@/components/Login/Callback/EveAuthCallback";
import { AuthMain } from "@/components/Main";
import { EveApps } from "@/eveapps";
import { ReactElement } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): ReactElement {
  return (
    <AuthMain>
      <EveAuthCallback
        clientId={EveApps.Markets.clientId}
        clientSecret={EveApps.Markets.clientSecret}
        charactersKey={EveApps.Markets.charactersKey}
        canBeAdmin={EveApps.Markets.canBeAdmin}
        searchParams={searchParams}
      />
    </AuthMain>
  );
}
