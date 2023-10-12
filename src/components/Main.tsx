import { PropsWithChildren, ReactElement } from "react";
import classNames from "classnames";
import Galaxy from "@/../public/galaxy.avif";
import { ContentBookend } from "./Bookend";
import { NavBar } from "./NavBar";
import { ParsedJSONError } from "@/error/error";
import { ErrorBoundaryGoBack } from "./ErrorBoundary";
import { Character, ICharacter } from "@/browser/character";
import { ParsedErrorThrower } from "./ErrorThrower";

export interface MainProps extends PropsWithChildren {
  character?: Character | ICharacter | null;
  path: string;
}
export const Main = ({
  character,
  path,
  children,
}: MainProps): ReactElement => (
  <main
    className={classNames(
      "etco-theme-dark",
      "bg-background-base",
      "text-background-text",
      "fixed",
      "inset-0"
    )}
  >
    <ContentBookend
      bookendPosition="top"
      bookend={<NavBar path={path} character={character} />}
    >
      {children}
    </ContentBookend>
  </main>
);

export const LoggedInMain = ({
  character,
  path,
  children,
}: MainProps): ReactElement => (
  <Main character={character} path={path}>
    <ErrorBoundaryGoBack href={`${path}/login`} resetTitle="Login">
      <LoginChecker character={character}>{children}</LoginChecker>
    </ErrorBoundaryGoBack>
  </Main>
);

interface LoginCheckerProps extends PropsWithChildren {
  character?: Character | ICharacter | null;
}
const LoginChecker = ({
  character,
  children,
}: LoginCheckerProps): ReactElement => {
  if (character === null || character === undefined) {
    return (
      <ParsedErrorThrower
        error={
          new ParsedJSONError({
            kind: ["NotLoggedIn"],
            message: "Please log in",
          })
        }
      />
    );
  } else {
    return <>{children}</>;
  }
};

export const AdminMain = ({
  character,
  path,
  children,
}: MainProps): ReactElement => (
  <Main character={character} path={path}>
    <ErrorBoundaryGoBack href={`${path}/login`} resetTitle="Login">
      <AdminChecker character={character}>{children}</AdminChecker>
    </ErrorBoundaryGoBack>
  </Main>
);

interface AdminCheckerProps extends PropsWithChildren {
  character?: Character | ICharacter | null;
}
const AdminChecker = ({
  character,
  children,
}: AdminCheckerProps): ReactElement => {
  if (character === null || character === undefined) {
    return (
      <ParsedErrorThrower
        error={
          new ParsedJSONError({
            kind: ["NotAdmin", "NotLoggedIn"],
            message: "Please log in",
          })
        }
      />
    );
  } else if (!character.admin) {
    return (
      <ParsedErrorThrower
        error={
          new ParsedJSONError({
            kind: ["NotAdmin", "CharacterNotAdmin"],
            message: "Please log in as an admin character",
          })
        }
      />
    );
  } else {
    return <>{children}</>;
  }
};

export const AuthMain = ({ children }: PropsWithChildren): ReactElement => (
  <main
    className={classNames(
      "etco-theme-dark",
      "text-gray-200",
      "bg-black",
      "fixed",
      "inset-0",
      "overflow-auto"
    )}
    style={{
      backgroundImage: `url(${Galaxy.src})`,
      backgroundPosition: "center center",
      backgroundSize: "cover",
      backgroundRepeat: "repeat",
      // backgroundBlendMode: "overlay",
    }}
  >
    {children}
  </main>
);
