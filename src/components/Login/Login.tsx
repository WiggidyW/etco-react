import { CurrentCharacterEveAppKind, EveAppKinds, EveApps } from "@/eveapps";
import { ErrorBoundaryTryAgain } from "../ErrorBoundary";
import { ReactElement, ReactNode } from "react";
import { newWebLoginUrl } from "./ssoURL";
import {
  LoginCharacterSelection,
  SelectionTabContainer,
} from "../Character/Selection";

export interface LoginProps {
  path: string[];
}

export const UserLogin = ({ path }: LoginProps): ReactElement => {
  const { parentPath, loginPath } = getLoginPaths(path);
  return (
    <ErrorBoundaryTryAgain>
      <LoginCharacterSelection
        charactersKey={EveApps["Auth"].charactersKey}
        redirectOnSelectPath={parentPath}
        redirectAfterLoginCallbackPath={loginPath}
        loginUrl={newWebLoginUrl(EveApps["Auth"])}
        canSelect={CurrentCharacterEveAppKind === "Auth"}
        checkIsAdmin={false}
      />
    </ErrorBoundaryTryAgain>
  );
};

export const AdminLogin = ({ path }: LoginProps): ReactElement => {
  const { parentPath, loginPath } = getLoginPaths(path);
  return (
    <ErrorBoundaryTryAgain>
      <SelectionTabContainer
        titles={EveAppKinds}
        tabs={
          EveAppKinds.map((title) => (
            <LoginCharacterSelection
              key={title}
              charactersKey={EveApps[title].charactersKey}
              redirectOnSelectPath={parentPath}
              redirectAfterLoginCallbackPath={loginPath}
              loginUrl={newWebLoginUrl(EveApps[title])}
              canSelect={CurrentCharacterEveAppKind === title}
              checkIsAdmin={EveApps[title].canBeAdmin}
            />
          )) as [ReactNode, ...[ReactNode]] // invalid cast if EveAppKinds is ever empty
        }
      />
    </ErrorBoundaryTryAgain>
  );
};

const getLoginPaths = (
  path: string[]
): { parentPath: string; loginPath: string } => {
  const parentPath = `/${path.slice(0, path.length - 1).join("/")}`;
  const loginPath = parentPath === "/" ? "/login" : `${parentPath}/login`;
  return { parentPath, loginPath };
};
