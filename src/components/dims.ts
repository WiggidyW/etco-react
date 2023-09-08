import { RefObject } from "react";

export interface Rect extends Offset, Dims {}

export interface Offset {
  top: number;
  left: number;
}

export interface Dims {
  width: number;
  height: number;
}

export const dimsEqual = (a: Dims, b: Dims): boolean =>
  a.width === b.width && a.height === b.height;

export const elementClientDims = <T extends HTMLElement>(element: T): Dims => ({
  width: element.clientWidth,
  height: element.clientHeight,
});

export const rectsEqual = (a: Rect, b: Rect): boolean =>
  a.width === b.width &&
  a.height === b.height &&
  a.top === b.top &&
  a.left === b.left;
