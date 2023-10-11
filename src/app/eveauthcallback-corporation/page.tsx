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
        clientId={EveApps.Corporation.clientId}
        clientSecret={EveApps.Corporation.clientSecret}
        charactersKey={EveApps.Corporation.charactersKey}
        canBeAdmin={EveApps.Corporation.canBeAdmin}
        searchParams={searchParams}
      />
    </AuthMain>
  );
}
