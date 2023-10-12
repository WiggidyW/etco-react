export const unknownToError = (e: unknown): Error => {
  if (e instanceof Error) return e;
  if (e instanceof ParsedJSONError) return e.toErrorMinified();
  if (typeof e === "string") return new Error(e);

  let message: string;
  try {
    message = JSON.stringify(e);
  } catch {
    message = "Unknown";
  }

  return new Error(message, { cause: e });
};

export const unknownToParsedJSONError = (e: unknown): ParsedJSONError => {
  if (e instanceof ParsedJSONError) {
    // return it as-is
    return e;
  } else if (typeof e === "string") {
    // check if the string is a serialized ParsedJSONErrorMessage
    const parsedMessage = toParsedJSONErrorMessage(e);
    if (parsedMessage !== null) {
      return new ParsedJSONError(parsedMessage);
    } else {
      return new ParsedJSONError({ kind: [], message: e });
    }
  } else if (e instanceof Error) {
    // check if the message is an embedded ParsedJSONErrorMessage
    const parsedMessage = toParsedJSONErrorMessage(e.message);
    if (parsedMessage !== null) {
      return new ParsedJSONError(parsedMessage);
    } else {
      return new ParsedJSONError({ kind: [], message: e.message }, e);
    }
  } else {
    let message: string;
    try {
      message = JSON.stringify(e);
    } catch {
      message = "Unknown";
    }
    return new ParsedJSONError({ kind: [], message }, e);
  }
};

const toParsedJSONErrorMessage = (
  errorMessage: string
): ParsedJSONErrorMessage | null => {
  try {
    const obj: unknown | { [key: string]: unknown } = JSON.parse(errorMessage);
    if (
      typeof obj === "object" &&
      obj !== null &&
      typeof (obj as { [key: string]: unknown }).message === "string" &&
      Array.isArray((obj as { [key: string]: unknown }).kind)
    ) {
      return obj as ParsedJSONErrorMessage;
    }
  } catch {}
  return null;
};

export class ParsedJSONError {
  readonly name: string = "ParsedJSONError";
  message: ParsedJSONErrorMessage;
  cause?: unknown;

  constructor(message: ParsedJSONErrorMessage, cause?: unknown) {
    this.message = message;
    this.cause = cause;
  }

  private toError(spacing: number): Error {
    return new Error(JSON.stringify(this.message, null, spacing), {
      cause: this.cause,
    });
  }

  toErrorMinified(): Error {
    return this.toError(0);
  }

  toErrorPretty(): Error {
    return this.toError(2);
  }
}

export interface ParsedJSONErrorMessage {
  kind: string[];
  message: string;
  [key: string]: unknown;
}

// export const newParsedJSONErrorMessage = (
//   name?: string,
//   kind?: string,
//   message?: string,
//   args?: { [key: string]: unknown }
// ): ParsedJSONErrorMessage => ({
//   name: name ?? "Unknown",
//   kind: kind ?? "Unknown",
//   message: message ?? "Unknown",
//   ...args,
// });
