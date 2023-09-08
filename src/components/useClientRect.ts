"use client";

import { useEffect, useRef, useState } from "react";
import { Rect, rectsEqual } from "./dims";

export const useClientRect = <T extends HTMLElement>(): {
  rect: Rect;
  ref: React.RefObject<T>;
} => {
  const [rect, setRect] = useState<Rect>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const ref = useRef<T>(null);

  const updateRect = (): void => {
    const element = ref.current;
    if (element === null) return;

    const boundingClientRect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const borderWidthLeft = parseFloat(style.borderLeftWidth);
    const borderWidthTop = parseFloat(style.borderTopWidth);

    const newRect = {
      height: element.clientHeight,
      width: element.clientWidth,
      top: boundingClientRect.top + borderWidthTop,
      left: boundingClientRect.left + borderWidthLeft,
    };

    if (!rectsEqual(rect, newRect)) setRect(newRect);
  };

  useEffect(() => {
    const obs = new ResizeObserver(updateRect);
    if (ref.current) obs.observe(ref.current);
    return () => {
      if (ref.current) obs.disconnect();
    };
  }, []);

  return { rect, ref };
};
