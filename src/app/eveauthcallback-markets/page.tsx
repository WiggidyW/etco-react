import { AdminEveAuthCallback } from "@/components/Login/EveAuthCallback";
import { EveAppKind } from "@/eveapps";
import { ReactElement } from "react";

export default function Page(): ReactElement {
  return <AdminEveAuthCallback app={EveAppKind.Markets} />;
}
