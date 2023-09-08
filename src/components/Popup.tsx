"use client";

import { useRef, useEffect, RefObject, ReactElement } from "react";
import { Dims, Rect } from "./dims";

const DEFAULT_DIMS_TRANSFORM = (dims: Dims): Dims => ({
  height: dims.height / 2,
  width: dims.width / 2,
});

export interface PopupProps {
  title: string;
  message: string;
  contentRect: Rect;
  onClickOutside?: () => void;
  dimsTransform?: (contentDims: Dims) => Dims;
}

export const Popup = ({
  title,
  message,
  contentRect,
  onClickOutside,
  dimsTransform = DEFAULT_DIMS_TRANSFORM,
}: PopupProps): ReactElement => {
  const popupRef = useOnClickOutside<HTMLDivElement>(onClickOutside);

  return (
    <div
      className="fixed flex items-center justify-center bg-black bg-opacity-50 z-20"
      style={contentRect}
    >
      <div
        className="bg-white rounded-md p-4"
        style={dimsTransform(contentRect)}
        ref={popupRef}
      >
        <div className="font-bold text-xl mb-2">{title}</div>
        <div className="text-base">{message}</div>
      </div>
    </div>
  );
};

const useOnClickOutside = <T extends HTMLElement>(
  onClickOutside?: () => void
): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (onClickOutside === undefined) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        onClickOutside();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickOutside]);

  return ref;
};
