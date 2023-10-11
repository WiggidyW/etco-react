"use client";

import classNames from "classnames";
import {
  Fragment,
  ReactElement,
  ReactNode,
  createRef,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface FlexWrapMaxChildStyle {
  minWidth: number;
  minHeight: number;
}
export interface FlexWrapMaxChildArgs<T extends HTMLElement>
  extends FlexWrapMaxChildStyle {
  ref: React.RefObject<T>;
}
export interface FlexWrapMaxtProps<T extends HTMLElement> {
  className?: string;
  childFuncs: ((args: FlexWrapMaxChildArgs<T>) => ReactNode)[];
}
// This component doesn't re-trigger the useEffect when parent dimensions or window size change.
// For this reason, forwarded refs must be used with elements that have fixed dimensions.
export const FlexWrapMax = <T extends HTMLElement>({
  className,
  childFuncs,
}: FlexWrapMaxtProps<T>): ReactElement => {
  const childRefs = useMemo(
    () => childFuncs.map(() => createRef<T>()),
    [childFuncs, childFuncs.length]
  );
  const [biggestDims, setBiggestDims] = useState<BiggestDims>(emptyBiggestDims);
  const { width: biggestWidth, height: biggestHeight } = biggestDims;

  useEffect(() => {
    const newBiggestDims = emptyBiggestDims();
    for (const ref of childRefs) {
      const { offsetWidth: refWidth = 0, offsetHeight: refHeight = 0 } =
        ref.current ?? {};
      newBiggestDims.width = Math.max(newBiggestDims.width, refWidth);
      newBiggestDims.height = Math.max(newBiggestDims.height, refHeight);
    }
    setBiggestDims(newBiggestDims);
  }, [childRefs]);

  return (
    <div className={classNames("flex", "flex-wrap", "min-w-min", className)}>
      {childFuncs.map((childFunc, i) => (
        <Fragment key={i}>
          {childFunc({
            ref: childRefs[i],
            minWidth: biggestWidth,
            minHeight: biggestHeight,
          })}
        </Fragment>
      ))}
      {/* <span className={classNames("flex-grow")} /> */}
    </div>
  );
};

interface BiggestDims {
  width: number;
  height: number;
}
const emptyBiggestDims = (): BiggestDims => ({ width: 0, height: 0 });
