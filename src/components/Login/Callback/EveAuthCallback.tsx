import { serverCookiesGetLoginCallbackRedirect } from "@/cookies/server";
import { EveAuthCallbackClientSide } from "./EveAuthCallbackClientSide";
import { Loading } from "@/components/Loading";
import { ReactElement, Suspense } from "react";
import { ParsedJSONError, unknownToParsedJSONError } from "@/error/error";
import { ICharacter } from "@/browser/character";
import { ErrorBoundaryGoBack } from "@/components/ErrorBoundary";
import { login } from "@/server-actions/grpc/other";
import { Result } from "@/components/todo";
import { ErrorThrower } from "@/components/ErrorThrower";
import { EsiApp } from "@/proto/etco";

export interface EveAuthCallbackProps {
  app: EsiApp;
  charactersKey: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export const EveAuthCallback = (props: EveAuthCallbackProps): ReactElement => {
  const redirectHref = serverCookiesGetLoginCallbackRedirect() ?? "/";
  return (
    <Suspense fallback={<Loading scale="25%" />}>
      <ErrorBoundaryGoBack href={redirectHref}>
        <EveAuthCallbackServerSide {...props} redirectHref={redirectHref} />
      </ErrorBoundaryGoBack>
    </Suspense>
  );
};

export interface EveAuthCallbackServerSideProps extends EveAuthCallbackProps {
  redirectHref: string;
}

const EveAuthCallbackServerSide = async ({
  app,
  charactersKey,
  searchParams,
  redirectHref,
}: EveAuthCallbackServerSideProps): Promise<ReactElement> => {
  const code = searchParams["code"];
  const fetch = async (): Promise<Result<ICharacter, ParsedJSONError>> => {
    try {
      // validate code
      if (code === undefined || typeof code !== "string") {
        throw new ParsedJSONError({
          kind: [],
          message: "No Code provided in search params",
        });
      }

      // fetch character
      const character = await login(code, app);

      return { ok: true, value: character };
    } catch (e) {
      const error = unknownToParsedJSONError(e);
      error.message.kind = ["EveAuthCallback", ...error.message.kind];
      return { ok: false, error };
    }
  };

  const characterResult = await fetch();
  if (characterResult.ok) {
    return (
      <EveAuthCallbackClientSide
        character={characterResult.value}
        charactersKey={charactersKey}
        redirectHref={redirectHref}
      />
    );
  } else {
    return (
      <ErrorThrower error={characterResult.error.toErrorMinified().message} />
    );
  }
};
