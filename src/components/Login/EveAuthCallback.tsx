"use client";

import { Popup } from "@/components/Popup";
import { useClientRect } from "@/components/useClientRect";
import { Character } from "@/storage/character";
import { loadCodeVerifier } from "@/storage/code_verifier";
import { loadIsAdminLogin, loadLoginPath } from "@/storage/path";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { CharactersManager } from "@/storage/appAuth/characters";
import { setToken, tokenKey } from "@/storage/token";
import { AdminEveAppKind, EveAppKind, getEveApp } from "@/eveapps";
import { Loading } from "@/components/Loading";
import { AdminCharactersManager } from "@/storage/appOther/characters";
import { repAsIs } from "@/proto/validate_transforms";
import { useEsiAppLogin } from "@/proto/rpc_hooks";
import { CurrentCharacterManager } from "@/storage/appAuth/character";
import { Rect } from "@/components/dims";
import {
  ICharacterAndToken,
  fetchCharacterAndCode,
  fetchCharacterFromToken,
} from "./sso";

export interface AdminEveAuthCallbackProps {
  app: AdminEveAppKind;
}

export const AdminEveAuthCallback = ({
  app,
}: AdminEveAuthCallbackProps): ReactElement => {
  const { rect, ref } = useClientRect();
  const queries = useSearchParams();
  const currentCharacter = CurrentCharacterManager.getCurrentCharacter();
  const code = queries.get("code");

  return (
    <main className="fixed inset-0" ref={ref}>
      {(() => {
        if (code === null) {
          return (
            <Popup
              title="Login Failed"
              message="No code was provided."
              contentRect={rect}
            />
          );
        } else if (currentCharacter === null) {
          return (
            <Popup
              title="Login Failed"
              message="No current character was provided."
              contentRect={rect}
            />
          );
        } else {
          return (
            <AdminEveAuthCallbackRPC
              code={code}
              rect={rect}
              app={app}
              currentCharacterId={currentCharacter.id}
            />
          );
        }
      })()}
    </main>
  );
};

interface AdminEveAuthCallbackRPCProps {
  code: string;
  rect: Rect;
  app: AdminEveAppKind;
  currentCharacterId: number;
}

const AdminEveAuthCallbackRPC = ({
  code,
  app,
  rect,
  currentCharacterId,
}: AdminEveAuthCallbackRPCProps): ReactElement => {
  const { rep, error } = useEsiAppLogin(currentCharacterId, code, app, repAsIs);

  if (rep !== null) {
    return (
      <AdminEveAuthCallbackFetch
        rect={rect}
        token={rep.token}
        jwt={rep.jwt}
        app={app}
      />
    );
  } else if (error !== null) {
    return (
      <Popup
        title="Login Failed"
        message={error.toString()}
        contentRect={rect}
      />
    );
  } else return <Loading parentDims={rect} />;
};

interface AdminEveAuthCallbackFetchProps {
  rect: Rect;
  token: string;
  jwt: string;
  app: AdminEveAppKind;
}

const AdminEveAuthCallbackFetch = ({
  rect,
  token,
  jwt,
  app,
}: AdminEveAuthCallbackFetchProps): ReactElement => {
  const router = useRouter();
  const loginPath = loadLoginPath() ?? "";

  const handleCharacter = (c: ICharacterAndToken) => {
    setToken(tokenKey(app, c.id), c.token);
    AdminCharactersManager.getInstance(app).addCharacter(
      Character.fromObject(c)
    );
    router.push(loginPath);
  };

  const error = useSSOFetchCharacterFromToken(token, jwt, handleCharacter);

  if (error !== null) {
    return (
      <Popup title="Login Failed" message={error.message} contentRect={rect} />
    );
  } else {
    return <Loading parentDims={rect} />;
  }
};

export const UserEveAuthCallback = (): ReactElement => {
  const { rect, ref } = useClientRect();
  const queries = useSearchParams();
  const codeVerifier = loadCodeVerifier();
  const code = queries.get("code");

  return (
    <main className="fixed inset-0" ref={ref}>
      {(() => {
        if (code === null) {
          return (
            <Popup
              title="Login Failed"
              message="No code was provided."
              contentRect={rect}
            />
          );
        } else if (codeVerifier === null) {
          return (
            <Popup
              title="Login Failed"
              message="No code verifier was provided."
              contentRect={rect}
            />
          );
        } else {
          return (
            <UserEveAuthCallbackSSO
              code={code}
              codeVerifier={codeVerifier}
              rect={rect}
            />
          );
        }
      })()}
    </main>
  );
};

interface UserEveAuthCallbackOkProps {
  code: string;
  rect: Rect;
  codeVerifier: string;
}

const UserEveAuthCallbackSSO = ({
  code,
  rect,
  codeVerifier,
}: UserEveAuthCallbackOkProps): ReactElement => {
  const router = useRouter();
  const isAdminLogin = loadIsAdminLogin();
  const loginPath = loadLoginPath() ?? "";

  const handleCharacter = (c: ICharacterAndToken) => {
    setToken(tokenKey(EveAppKind.Auth, c.id), c.token);
    CharactersManager.addCharacter(Character.fromObject(c));
    router.push(loginPath);
  };

  const error = useSSOFetchCharacterAndCode(
    code,
    getEveApp(EveAppKind.Auth).clientId,
    codeVerifier,
    isAdminLogin,
    handleCharacter
  );

  if (error !== null) {
    return (
      <Popup title="Login Failed" message={error.message} contentRect={rect} />
    );
  } else {
    return <Loading parentDims={rect} />;
  }
};

const useSSOFetchCharacterAndCode = (
  code: string,
  clientId: string,
  codeVerifier: string,
  admin: boolean,
  handleCharacter: (c: ICharacterAndToken) => void
) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCharacterAndCode(code, clientId, codeVerifier, admin)
      .then(handleCharacter)
      .catch((e: any) => setError(e as Error));
  }, [code, clientId, codeVerifier, admin]);

  return error;
};

const useSSOFetchCharacterFromToken = (
  token: string,
  jwt: string,
  handleCharacter: (c: ICharacterAndToken) => void
) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCharacterFromToken(token, jwt, false)
      .then(handleCharacter)
      .catch((e: any) => setError(e as Error));
  }, [token, jwt]);

  return error;
};
