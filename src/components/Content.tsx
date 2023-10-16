"use client";

import classNames from "classnames";
import {
  PropsWithChildren,
  ReactElement,
  ReactPortal,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Axis } from "./todo";

type ContentRef = RefObject<HTMLDivElement>;

const ContentContext = createContext<ContentRef>({ current: null });

const useContentRef = (): ContentRef => useContext(ContentContext);

export interface ContentProps extends PropsWithChildren {
  className?: string;
  growAxis?: Axis;
}

export const Content = ({ children, ...props }: ContentProps): ReactElement => (
  <ContentContextProvider>
    <ContentDiv {...props}>{children}</ContentDiv>
  </ContentContextProvider>
);

export const ContentDiv = ({
  className,
  growAxis,
  children,
}: ContentProps): ReactElement => {
  const ref = useContentRef();
  return (
    <div
      className={classNames(
        "relative",
        "flex-grow",
        "overflow-auto",
        {
          "w-full": growAxis === "vertical",
          "h-full": growAxis === "horizontal",
        },
        className
      )}
      ref={ref}
    >
      {children}
    </div>
  );
};

export const ContentContextProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const ref: ContentRef = useRef(null);
  return (
    <ContentContext.Provider value={ref}>{children}</ContentContext.Provider>
  );
};

export const ContentPortal = ({
  children,
}: PropsWithChildren): ReactPortal | null => {
  const contentRef = useContentRef();
  if (contentRef.current) {
    return createPortal(children, contentRef.current);
  } else {
    return null;
  }
};

export const useContentRect = (): DOMRect => {
  const contentRef = useContentRef();
  const [rect, setRect] = useState<DOMRect>(() => new DOMRect());

  const updateRect = () => {
    if (contentRef.current) setRect(contentRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (contentRef.current) {
      const obs = new ResizeObserver(updateRect);
      obs.observe(contentRef.current);
      return () => obs.disconnect();
    }
  }, []);

  return rect;
};
