"use client";

import {
  ReadonlyURLSearchParams,
  useParams as nextUseParams,
  usePathname as nextUsePathname,
  useSearchParams as nextUseSearchParams,
} from "next/navigation";

const throwInvalidContext = (): never => {
  throw new Error("this software must be used from a Next.JS App context");
};

export const useParams = (): Record<string, string | string[]> => {
  const params = nextUseParams();
  if (params === null) return throwInvalidContext();
  return params;
};

export const usePathname = (): string => {
  const pathname = nextUsePathname();
  if (pathname === null) return throwInvalidContext();
  return pathname;
};

export const useSearchParams = (): ReadonlyURLSearchParams => {
  const searchParams = nextUseSearchParams();
  if (searchParams === null) return throwInvalidContext();
  return searchParams;
};
