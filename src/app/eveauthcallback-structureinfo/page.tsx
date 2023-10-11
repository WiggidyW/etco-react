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
        clientId={EveApps.StructureInfo.clientId}
        clientSecret={EveApps.StructureInfo.clientSecret}
        charactersKey={EveApps.StructureInfo.charactersKey}
        canBeAdmin={EveApps.StructureInfo.canBeAdmin}
        searchParams={searchParams}
      />
    </AuthMain>
  );
}
