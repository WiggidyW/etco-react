"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export interface SizeTransformProps {
  hTransform?: (size: number) => number;
  wTransform?: (size: number) => number;
}

export const useMinSize = <T extends HTMLElement>(): {
  ref: RefObject<T>;
  size: number;
} => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (ref.current) {
        const { offsetWidth, offsetHeight } = ref.current;
        setSize(Math.min(offsetWidth, offsetHeight));
      }
    });

    if (ref.current) obs.observe(ref.current);

    return () => {
      if (ref.current) obs.unobserve(ref.current);
    };
  }, []);

  return { ref, size };
};
