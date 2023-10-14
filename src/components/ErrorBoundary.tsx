"use client";

import { ParsedJSONError, unknownToParsedJSONError } from "@/error/error";
import { ErrorBoundary as _ErrorBoundary } from "react-error-boundary";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

export interface ErrorBoundaryRefreshProps extends PropsWithChildren {
  resetTitle?: string;
}
export const ErrorBoundaryRefresh = ({
  resetTitle = "Refresh",
  children,
}: ErrorBoundaryRefreshProps): ReactNode => (
  <ErrorBoundaryNoArgs
    fallbackChildren={
      <button onClick={() => window.location.reload()}>{resetTitle}</button>
    }
  >
    {children}
  </ErrorBoundaryNoArgs>
);

export interface ErrorBoundaryGoBackProps extends PropsWithChildren {
  resetTitle?: string;
  href: string;
}
export const ErrorBoundaryGoBack = ({
  resetTitle = "Go back",
  href,
  children,
}: ErrorBoundaryGoBackProps): ReactNode => (
  <ErrorBoundaryNoArgs fallbackChildren={<Link href={href}>{resetTitle}</Link>}>
    {children}
  </ErrorBoundaryNoArgs>
);

export interface ErrorBoundaryTryAgainProps extends PropsWithChildren {
  resetTitle?: string;
}
export const ErrorBoundaryTryAgain = ({
  resetTitle = "Try again",
  children,
}: ErrorBoundaryTryAgainProps): ReactNode => (
  <ErrorBoundary
    fallbackChildren={({ resetErrorBoundary }) => (
      <button onClick={resetErrorBoundary}>{resetTitle}</button>
    )}
  >
    {children}
  </ErrorBoundary>
);

interface ErrorBoundaryNoArgsProps extends PropsWithChildren {
  fallbackChildren?: ReactNode;
}
const ErrorBoundaryNoArgs = ({
  fallbackChildren,
  children,
}: ErrorBoundaryNoArgsProps): ReactNode => (
  <ErrorBoundary fallbackChildren={() => fallbackChildren}>
    {children}
  </ErrorBoundary>
);

interface ErrorBoundaryProps extends PropsWithChildren {
  fallbackChildren: (args: {
    error: ParsedJSONError;
    resetErrorBoundary: () => void;
  }) => ReactNode;
}
const ErrorBoundary = ({ fallbackChildren, children }: ErrorBoundaryProps) => {
  return (
    <_ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        const parsedJSONError = unknownToParsedJSONError(error);
        if (parsedJSONError.message.message === "NEXT_NOT_FOUND") {
          return notFound();
        }
        return (
          <Fallback error={parsedJSONError}>
            {fallbackChildren({ error: parsedJSONError, resetErrorBoundary })}
          </Fallback>
        );
      }}
    >
      {children}
    </_ErrorBoundary>
  );
};

interface FallbackProps extends PropsWithChildren {
  error: ParsedJSONError;
}
const Fallback = ({ error, children }: FallbackProps) => {
  const message = useMemo(() => error.toErrorPretty().message, [error]);
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{message}</pre>
      {children}
    </div>
  );
};
