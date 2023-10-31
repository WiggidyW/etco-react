import { LinkProps } from "next/link";

export type Axis = "vertical" | "horizontal";

export type Position = "top" | "bottom" | "left" | "right";

export type ImmutableAfterLoaded<T> = { inner: Readonly<T> | undefined };

export const newImmutableAfterLoaded = <T>(): ImmutableAfterLoaded<T> => ({
  inner: undefined,
});

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ResultOk = <T, E>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

export const ResultErr = <T, E>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

export const ResultThrow = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value;
  } else {
    throw result.error;
  }
};

export type Option<T> = { some: true; value: T } | { some: false };

export const OptionSome = <T>(value: T): Option<T> => ({
  some: true,
  value,
});

export const OptionNone: Option<any> = { some: false };

// export const OptionNone = <T>(): Option<T> => ({ some: false });

export type Scale = "25%" | "50%" | "75%" | "100%";
export type SizeUnit = `${number}${"px" | "rem" | "em" | "vh" | "vw"}`;

export const iterIndexed = <T>(iter: Iterable<T>): Iterable<[number, T]> => {
  let i = 0;
  return (function* () {
    for (const item of iter) {
      yield [i, item];
      i++;
    }
  })();
};

export type NextLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps &
  React.RefAttributes<HTMLAnchorElement>;

type UnionPropType<
  O extends object,
  PROP extends string | number | symbol
> = O extends { [K in PROP]: infer U } ? U : undefined;

export const getOpt = <O extends object, PROP extends string | number | symbol>(
  obj: O,
  key: PROP
): UnionPropType<O, PROP> => (key in obj ? (obj as any)[key] : undefined);

export const getOptFromOpt = <
  O extends object,
  PROP extends string | number | symbol
>(
  obj: O | undefined | null,
  key: PROP
): UnionPropType<O, PROP> | undefined => (obj ? getOpt(obj, key) : undefined);

export type NotBoolean<T> = T extends boolean ? never : T;

export type SameOrNew<T> = NotBoolean<T> | true;

export const newSameOrNew = <T>(
  a: NotBoolean<T>,
  b: NotBoolean<T> | undefined
): SameOrNew<T> => {
  if (b === undefined || a === b) {
    return true;
  } else {
    return b;
  }
};
