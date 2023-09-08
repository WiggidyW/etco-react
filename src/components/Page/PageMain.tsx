"use client";

import { ReactElement, ReactNode } from "react";
import { Rect } from "../dims";
import { Content } from "./Content";
import { getNavBar } from "./NavBar";
import { useClientRect } from "../useClientRect";

export interface PageMainProps {
  path: string;
  children?: (args: Rect) => ReactNode;
}

export const PageMain = ({ path, children }: PageMainProps): ReactElement => {
  const { rect, ref } = useClientRect<HTMLDivElement>();
  const { NavBar, height: navBarHeight } = getNavBar(rect, path);
  return (
    <main className="fixed inset-0" ref={ref}>
      <NavBar />
      <Content
        width={rect.width}
        height={Math.max(rect.height - navBarHeight, 0)}
        top={rect.top + navBarHeight}
        left={rect.left}
      >
        {(rect) => children && children(rect)}
      </Content>
    </main>
  );
};
