"use client";

import {
  useRef,
  useEffect,
  RefObject,
  ReactElement,
  ReactNode,
  PropsWithChildren,
} from "react";
import classNames from "classnames";
import { useContentRect } from "./Content";
// import { useRouter } from "next/navigation";

export type PopupStyle = "default" | "success" | "failure";

export type DigitStr =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
export type DoubleDigitStr = `${DigitStr}${DigitStr}`;
export type ZeroToHundredStr = DigitStr | `${DigitStr}${DigitStr}` | "100";

export interface PopupProps {
  childrenClassName?: string;
  footerClassName?: string;
  onClickOutside?: () => void;
  popupStyle?: PopupStyle;
  percentage?: ZeroToHundredStr;
  footer?: ReactNode;
}
export const Popup = ({
  popupStyle = "default",
  onClickOutside,
  percentage = "50",
  childrenClassName,
  children,
  footerClassName,
  footer,
}: PopupProps & PropsWithChildren): ReactElement => {
  const popupRef = useOnClickOutside<HTMLDivElement>(onClickOutside);
  const { x: left, y: top, width, height } = useContentRect();
  return (
    <div
      className={classNames(
        "fixed",
        // "absolute",
        // "inset-0",
        "flex",
        "items-center",
        "justify-center",
        "bg-black",
        "bg-opacity-70",
        "z-40"
      )}
      style={{ top, left, width, height }}
    >
      <div
        className={classNames("flex", "flex-col", "border", {
          [classNames(
            "bg-primary-base",
            "border-primary-border",
            "text-primary-text"
          )]: popupStyle === "default",
          [classNames(
            "bg-success-base",
            "border-success-border",
            "text-success-text"
          )]: popupStyle === "success",
          [classNames(
            "bg-failure-base",
            "border-failure-border",
            "text-failure-text"
          )]: popupStyle === "failure",
        })}
        style={{
          maxWidth: `${percentage}vw`,
          maxHeight: `${percentage}vh`,
          width: `${percentage}%`,
          height: `${percentage}%`,
        }}
        ref={popupRef}
      >
        <div
          className={classNames(
            "flex-grow",
            "overflow-auto",
            "p-2",
            childrenClassName
          )}
        >
          {children}
        </div>
        {footer && (
          <div
            className={classNames(
              "border-t",
              "p-1",
              {
                "border-primary-border": popupStyle === "default",
                "border-success-border": popupStyle === "success",
                "border-failure-border": popupStyle === "failure",
              },
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface MessagePopupProps extends PopupProps {
  title: string;
  message: string;
}
export const MessagePopup = ({
  message,
  title,
  ...props
}: MessagePopupProps): ReactElement => (
  <Popup {...props}>
    <div className="font-bold text-xl mb-2">{title}</div>
    <div className="text-base">{message}</div>
  </Popup>
);

// export interface MessagePopupWithRedirectProps
//   extends Omit<MessagePopupProps, "onClickOutside"> {
//   href: string;
// }

// export const MessagePopupWithRedirect = ({
//   href,
//   ...MessagePopupProps
// }: MessagePopupWithRedirectProps): ReactElement => {
//   const router = useRouter();
//   const onClickOutside = () => router.push(href);
//   return (
//     <MessagePopup {...MessagePopupProps} onClickOutside={onClickOutside} />
//   );
// };

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
