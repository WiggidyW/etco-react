"use client";

import { useBrowserContext } from "@/browser/context";
import { ReactElement } from "react";

const TwoDecimals = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const MaybeTwoDecimals = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
};

export const formatQuantity = (quantity: number): string =>
  quantity.toLocaleString(undefined, MaybeTwoDecimals);

export const formatPrice = (price: number): string =>
  `Ƶ ${price.toLocaleString(undefined, TwoDecimals)}`;

export const formatTime = (time: number): string =>
  time > 0 ? new Date(time * 1000).toLocaleString() : "";

export interface LocaleTextProps<V> {
  fmt: (v: V) => string;
  v: V;
}
export const LocaleText = <V,>({
  fmt,
  v,
}: LocaleTextProps<V>): ReactElement => {
  const browserCtx = useBrowserContext();
  if (browserCtx === null) {
    return <></>;
  } else {
    return <>{fmt(v)}</>;
  }
};
