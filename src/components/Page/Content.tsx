// "use client";

import { ReactElement, ReactNode } from "react";
import { Rect } from "../dims";

export interface ContentProps extends Rect {
  children?: (args: Rect) => ReactNode;
}

export const Content = ({ children, ...rect }: ContentProps): ReactElement => (
  <div className="fixed z-10" style={rect}>
    {children && children(rect)}
  </div>
);
