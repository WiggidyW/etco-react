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
        clientId={EveApps.Auth.clientId}
        clientSecret={EveApps.Auth.clientSecret}
        charactersKey={EveApps.Auth.charactersKey}
        canBeAdmin={EveApps.Auth.canBeAdmin}
        searchParams={searchParams}
      />
    </AuthMain>
  );
}
