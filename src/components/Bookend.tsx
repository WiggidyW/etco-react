import classNames from "classnames";
import {
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from "react";
import { ContentContextProvider, ContentDiv } from "./Content";
import { Axis, Position } from "./todo";

interface BaseBookendProps {
  className?: string;
  children?: ReactNode;
}

interface VerticalBookendProps extends BaseBookendProps {
  height: CSSProperties["height"];
}

const BookendBaseClassNames = classNames(
  "bg-bookend-base",
  "text-bookend-text",
  "border-bookend-border",
  "shadow-xl",
  "flex-shrink-0"
);

export const VerticalBookend = ({
  className,
  height,
  children,
}: VerticalBookendProps): ReactElement => (
  <div
    className={classNames(
      "w-full",
      "border-b",
      "border-t",
      BookendBaseClassNames,
      className
    )}
    style={{ height: height }}
  >
    {children}
  </div>
);

interface HorizontalBookendProps extends BaseBookendProps {
  width: CSSProperties["width"];
}

export const HorizontalBookend = ({
  className,
  width,
  children,
}: HorizontalBookendProps): ReactElement => (
  <div
    className={classNames(
      "h-full",
      "border-l",
      "border-r",
      BookendBaseClassNames,
      className
    )}
    style={{ width: width }}
  >
    {children}
  </div>
);

// export interface BookendProps extends BaseBookendProps {
//   height?: CSSProperties["height"];
//   width?: CSSProperties["width"];
// }

// export type BookendProps =
//   | (VerticalBookendProps)
//   | (HorizontalBookendProps);

// export const Bookend = ({
//   // position,
//   className: classNameArg,
//   children,
//   height,
//   width,
// }: BookendProps): React.ReactElement => {
//   const className: string = classNames(
//     "bg-bookend-base",
//     "text-bookend-text",
//     "border-bookend-border",
//     classNameArg
//   );
//   if (alignment === "vertical") {
//     return (
//       <VerticalBookend className={className} size={size}>
//         {children}
//       </VerticalBookend>
//     );
//   } else {
//     // alignment === "horizontal"
//     return (
//       <HorizontalBookend className={className} size={size}>
//         {children}
//       </HorizontalBookend>
//     );
//   }
// };

export interface ContentBookendProps extends PropsWithChildren {
  bookendPosition: Position;
  bookend: ReactNode;
}

export const ContentBookend = ({
  bookendPosition,
  bookend,
  children,
}: ContentBookendProps): ReactElement => {
  let growAxis: Axis;
  let bookendFirst: boolean;

  switch (bookendPosition) {
    case "top":
      growAxis = "vertical";
      bookendFirst = true;
      break;
    case "bottom":
      growAxis = "vertical";
      bookendFirst = false;
      break;
    case "left":
      growAxis = "horizontal";
      bookendFirst = true;
      break;
    case "right":
      growAxis = "horizontal";
      bookendFirst = false;
      break;
  }

  return (
    <div
      className={classNames("flex", "w-full", "h-full", {
        "flex-col": growAxis === "vertical",
        "flex-row": growAxis === "horizontal",
      })}
    >
      <ContentContextProvider>
        {bookendFirst ? (
          <>
            {bookend}
            <ContentDiv growAxis={growAxis}>{children}</ContentDiv>
          </>
        ) : (
          <>
            <ContentDiv growAxis={growAxis}>{children}</ContentDiv>
            {bookend}
          </>
        )}
      </ContentContextProvider>
    </div>
  );
};
