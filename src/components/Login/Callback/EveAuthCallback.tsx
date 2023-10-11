import {
  serverCookiesGetCheckIsAdmin,
  serverCookiesGetLoginCallbackRedirect,
} from "@/cookies/server";
import { fetchCharacter } from "@/server-actions/fetchCharacter";
import { EveAuthCallbackClientSide } from "./EveAuthCallbackClientSide";
import { Loading } from "@/components/Loading";
import { ReactElement, Suspense } from "react";
import { ParsedJSONError, unknownToParsedJSONError } from "@/error/error";
import { ThrowKind, throwErr } from "@/server-actions/throw";
import { ICharacter } from "@/browser/character";
import { ErrorBoundaryGoBack } from "@/components/ErrorBoundary";
import { isAdmin } from "@/server-actions/grpc/other";

export interface EveAuthCallbackProps {
  clientId: string;
  clientSecret: string;
  charactersKey: string;
  canBeAdmin: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
}

export const EveAuthCallback = (props: EveAuthCallbackProps): ReactElement => {
  const redirectHref = serverCookiesGetLoginCallbackRedirect() ?? "/";
  console.log("redirectHref", redirectHref);
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
  clientId,
  clientSecret,
  charactersKey,
  canBeAdmin,
  searchParams,
  redirectHref,
}: EveAuthCallbackServerSideProps): Promise<ReactElement> => {
  const code = searchParams["code"];
  const checkIsAdmin = canBeAdmin && serverCookiesGetCheckIsAdmin();

  const fetch = async (): Promise<ICharacter> => {
    try {
      // validate code
      if (code === undefined || typeof code !== "string") {
        throw new ParsedJSONError({
          kind: [],
          message: "No Code provided in search params",
        });
      }

      // fetch character
      const character = await fetchCharacter(
        code,
        clientId,
        clientSecret,
        checkIsAdmin,
        ThrowKind.Parsed
      );

      // check if admin and set admin if so
      if (checkIsAdmin) {
        character.admin = await isAdmin(
          character.refreshToken,
          ThrowKind.Parsed
        );
      }

      return character;
    } catch (e) {
      const error = unknownToParsedJSONError(e);
      error.message.kind = ["EveAuthCallback", ...error.message.kind];
      return throwErr(error, ThrowKind.Minified);
    }
  };

  const character = await fetch();

  return (
    <EveAuthCallbackClientSide
      character={character}
      charactersKey={charactersKey}
      redirectHref={redirectHref}
    />
  );
};
