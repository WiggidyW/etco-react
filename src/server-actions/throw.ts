import { ParsedJSONError } from "@/error/error";

export enum ThrowKind {
  Parsed = "Parsed",
  Minified = "Minified",
  Pretty = "Pretty",
}

export const throwErr = (
  e: ParsedJSONError,
  kind: ThrowKind = ThrowKind.Parsed
): never => {
  switch (kind) {
    case ThrowKind.Minified:
      throw e.toErrorMinified();
    case ThrowKind.Parsed:
      throw e;
    case ThrowKind.Pretty:
      throw e.toErrorPretty();
  }
};
