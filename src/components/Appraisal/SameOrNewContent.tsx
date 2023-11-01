import { SameOrNew } from "../todo";
import { LocaleText } from "./Util";
import { ReactElement } from "react";

interface SameOrNewFormattedValueProps {
  v: any;
  cmpResult?: boolean;
  fmt?: (x: any) => string;
  locale?: boolean;
}
const SameOrNewFormattedValue = ({
  fmt,
  v,
  cmpResult,
  locale,
}: SameOrNewFormattedValueProps) => {
  if (fmt === undefined) {
    return <>{v}</>;
  }
  let fmtWithCmp: (x: any) => string;
  if (cmpResult === undefined) {
    fmtWithCmp = fmt;
  } else if (cmpResult === true) {
    fmtWithCmp = (x) => `${fmt(x)} 🠕`;
  } else {
    // cmpResult === false
    fmtWithCmp = (x) => `${fmt(x)} 🠗`;
  }
  if (locale) {
    return <LocaleText fmt={fmtWithCmp} v={v} />;
  } else {
    // locale === false || locale === undefined
    return <>{fmtWithCmp(v)}</>;
  }
};

export interface SameOrNewContentProps {
  fmt?: (x: any) => string;
  oldT: any;
  newT?: SameOrNew<any>;
  cmp?: boolean;
  locale?: boolean;
}
export const SameOrNewContent = ({
  fmt,
  oldT,
  newT,
  cmp,
  locale,
}: SameOrNewContentProps): ReactElement => {
  if (newT === true || newT === undefined) {
    return (
      <h1>
        <SameOrNewFormattedValue v={oldT} fmt={fmt} locale={locale} />
      </h1>
    );
  } else {
    let newGreater: boolean | undefined;
    if (!cmp) {
      newGreater = undefined;
    } else if (newT > oldT) {
      newGreater = true;
    } else {
      // newT <= oldT
      newGreater = false;
    }
    return (
      <>
        <h1>
          <SameOrNewFormattedValue v={oldT} fmt={fmt} locale={locale} />
        </h1>
        <h1>
          <SameOrNewFormattedValue
            v={newT}
            fmt={fmt}
            locale={locale}
            cmpResult={newGreater}
          />
        </h1>
      </>
    );
  }
};
