import {
  ImgHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from "react";
import { MouseEvent as ReactMouseEvent } from "react";
import { NextLinkProps } from "../todo";
import classNames from "classnames";
import Link from "next/link";
import "./Portrait.css";
import { Entity, EntityShared } from "@/browser/entity";

export type Size =
  | "auto"
  | "auto-sm"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

export type CharacterPortraitSize =
  | "auto"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";

const QuerySizeMap: { [key in Size]: number } = {
  "2xs": 32, // 16x16
  xs: 32, // 24x24
  sm: 32, // 32x32
  md: 64, // 48x48
  lg: 64, // 64x64
  xl: 128, // 96x96
  "2xl": 128, // 128x128
  "3xl": 256, // 192x192
  "4xl": 256, // 256x256
  "5xl": 512, // 384x384
  "6xl": 512, // 512x512
  auto: 1024,
  "auto-sm": 512,
};

const CharacterPortraitSizeArgsMap: {
  [key in CharacterPortraitSize]: [Size, Size];
} = {
  ["xs"]: ["sm", "2xs"], // 32x32, 16x16
  ["sm"]: ["md", "xs"], // 48x48, 24x24
  ["md"]: ["lg", "xs"], // 64x64, 24x24
  ["lg"]: ["xl", "sm"], // 96x96, 32x32
  ["xl"]: ["2xl", "sm"], // 128x128, 32x32
  ["2xl"]: ["3xl", "md"], // 192x192, 48x48
  ["3xl"]: ["4xl", "md"], // 256x256, 48x48
  ["4xl"]: ["5xl", "lg"], // 384x384, 64x64
  ["5xl"]: ["6xl", "lg"], // 512x512, 64x64
  ["auto"]: ["auto", "auto-sm"],
};

interface BaseLoginCharacterPortraitProps<C extends Entity> {
  character: C;
  nameBarSize?: CharacterPortraitSize;
  nameBarMinFit?: boolean;
  nameBar?: boolean;
  nameAlign?: "left" | "center" | "right";
  loginEffect?: boolean;
  onClickOrLink?:
    | { kind: "onClick"; onClick: (e: ReactMouseEvent, character: C) => void }
    | ({ kind: "link" } & NextLinkProps);
  onTerminate?: (character: C) => void;
}
export type LoginCharacterPortraitProps<C extends Entity> =
  | (BaseLoginCharacterPortraitProps<C> & {
      size?: Exclude<CharacterPortraitSize, "auto">;
      children?: ReactNode;
    })
  | (BaseLoginCharacterPortraitProps<C> & {
      size: "auto";
      children?: undefined;
    });
export const LoginCharacterPortrait = <C extends Entity>({
  character,
  nameBar = true,
  nameBarMinFit,
  nameAlign = "left",
  loginEffect = true,
  onClickOrLink,
  onTerminate,
  children,
  size = children ? "lg" : "auto",
  nameBarSize = size,
}: LoginCharacterPortraitProps<C>): ReactElement => {
  const entity = character as EntityShared;

  interface PortraitContainerProps extends PropsWithChildren {
    portrait: ReactNode;
  }
  const PortraitContainer = ({
    children,
    portrait,
  }: PortraitContainerProps): ReactElement => {
    const hasChildren = children !== undefined;
    const isFlexGrow = !hasChildren && nameBar && size === "auto";
    if (isFlexGrow) {
      return (
        <div className={classNames("relative", "flex-grow", "flex-shrink")}>
          <div className={classNames("absolute", "inset-0")}>{portrait}</div>
        </div>
      );
    } else if (hasChildren) {
      return (
        <div className={classNames("flex")}>
          {portrait}
          {children}
        </div>
      );
    } else {
      return <>{portrait}</>;
    }
  };
  return (
    <div
      className={classNames("max-h-full", {
        group: loginEffect,
        "inline-block": size !== "auto",
        [classNames("flex", "flex-col", "h-full")]: size === "auto",
        "min-w-max": children !== undefined,
      })}
    >
      {nameBar && (
        <NameBar
          nameAlign={nameAlign}
          characterName={entity.name}
          characterTicker={entity.ticker}
          loginEffect={loginEffect}
          onTerminate={onTerminate && (() => onTerminate(character))}
          minFit={nameBarMinFit}
          size={nameBarSize}
        />
      )}
      <PortraitContainer
        portrait={
          <CharacterPortrait
            className={classNames({ "flex-shrink-0": children !== undefined })}
            character={character}
            size={size}
            backdrop={true}
            loginEffect={loginEffect}
            onClickOrLink={onClickOrLink}
          />
        }
      >
        {children}
      </PortraitContainer>
    </div>
  );
};

export interface CharacterPortraitProps<C extends Entity> {
  character: C;
  className?: string;
  size?: CharacterPortraitSize;
  backdrop?: boolean;
  loginEffect?: boolean;
  rounded?: boolean;
  onClickOrLink?:
    | { kind: "onClick"; onClick: (e: ReactMouseEvent, character: C) => void }
    | ({ kind: "link" } & NextLinkProps);
}
export const CharacterPortrait = <C extends Entity>({
  character,
  className,
  size = "auto",
  backdrop = false,
  loginEffect = false,
  rounded,
  onClickOrLink,
}: CharacterPortraitProps<C>): ReactElement => {
  const [faceSize, restSize] = CharacterPortraitSizeArgsMap[size];
  let primaryPortrait: ReactNode;
  if ("corporationId" in character) {
    primaryPortrait = (
      <CharacterFacePortrait queryId={character.id} size={faceSize} />
    );
  } else if ("isCorp" in character) {
    primaryPortrait = (
      <CorporationFacePortrait queryId={character.id} size={faceSize} />
    );
  } else {
    primaryPortrait = (
      <AllianceFacePortrait queryId={character.id} size={faceSize} />
    );
  }
  const entity = character as EntityShared;
  return (
    <div
      className={classNames(
        "portrait-character",
        `size-${size}`,
        "relative",
        "select-none",
        "overflow-hidden",
        {
          "rounded-full": rounded,
          [classNames("p-1", "bg-black", "bg-opacity-75")]: backdrop,
          "h-min": size !== "auto",
          "h-full": size === "auto",
        },
        className
      )}
    >
      <div
        className={classNames("portrait-character-image-container", {
          "h-full": size === "auto",
          [classNames("inline-block", "align-top")]: size !== "auto",
          [classNames(
            "grayscale",
            "brightness-150",
            "transition-all",
            "duration-500",
            "group-active:brightness-100",
            "group-hover:brightness-100",
            "group-active:grayscale-0",
            "group-hover:grayscale-0"
          )]: loginEffect,
        })}
      >
        {primaryPortrait}
        <CorporationFacePortrait
          queryId={entity.corporationId}
          size={restSize}
          className={classNames("absolute", "bottom-0")}
        />
        <AllianceFacePortrait
          queryId={entity.allianceId}
          size={restSize}
          className={classNames("absolute", "bottom-0", "right-0")}
        />
      </div>
      {entity.admin && (
        <svg
          viewBox="0 0 30 20"
          className={classNames(
            "portrait-character-admin-text",
            "absolute",
            "top-0",
            "left-0",
            "w-full",
            "max-h-full",
            "text-light-red-base",
            "opacity-70",
            "mt-1"
          )}
        >
          <text
            textAnchor="middle"
            dominantBaseline="hanging"
            x="50%"
            fill="currentColor"
            fontSize="10"
          >
            Admin
          </text>
        </svg>
      )}
      {(() => {
        switch (onClickOrLink?.kind) {
          case undefined:
            return <></>;
          case "onClick":
            const { onClick } = onClickOrLink;
            return (
              <div
                className={classNames("absolute", "inset-0", "cursor-pointer")}
                onClick={(e) => onClick(e, character)}
              />
            );
          case "link":
            const { kind: _, className, ...linkProps } = onClickOrLink;
            return (
              <Link
                {...linkProps}
                href={onClickOrLink.href}
                onMouseDown={(e) => e.preventDefault()} // prevent image drag
                className={classNames("absolute", "inset-0", className)}
              />
            );
        }
      })()}
    </div>
  );
};

interface NameBarProps {
  characterTicker?: string;
  characterName: string;
  size?: CharacterPortraitSize;
  nameAlign?: "left" | "center" | "right";
  minFit?: boolean;
  loginEffect?: boolean;
  onTerminate?: () => void;
}
const NameBar = ({
  characterTicker,
  characterName,
  minFit = false,
  size = "auto",
  nameAlign = "left",
  loginEffect = true,
  onTerminate,
}: NameBarProps): ReactElement => {
  return (
    <div
      className={classNames(
        { [classNames("w-0", "min-w-full")]: !minFit },
        "mb-1",
        "select-none",
        "p-1",
        "bg-black",
        "bg-opacity-75"
      )}
    >
      <div
        className={classNames(
          "name-bar",
          `size-${size}`,
          "flex",
          "font-light",
          "whitespace-nowrap",
          "pl-1",
          "pr-1",
          { "min-w-min": minFit }
        )}
      >
        <h1
          className={classNames(
            "flex-grow",
            "overflow-hidden",
            "overflow-ellipsis",
            {
              "text-left": nameAlign === "left",
              "text-center": nameAlign === "center",
              "text-right": nameAlign === "right",
              "brightness-150": !loginEffect,
              [classNames(
                "group-active:brightness-150",
                "group-hover:brightness-150",
                "transition-all",
                "duration-500"
              )]: loginEffect,
            }
          )}
        >
          {characterTicker
            ? `[${characterTicker}] ${characterName}`
            : characterName}
        </h1>
        {onTerminate !== undefined && (
          <TerminateButton
            className={classNames(
              "pl-1",
              "-translate-y-0.5",
              "h-full",
              "max-h-full",
              "bg-transparent",
              {
                [classNames(
                  "opacity-0",
                  "group-active:opacity-100",
                  "group-hover:opacity-100"
                )]: loginEffect,
              }
            )}
            onClick={() => onTerminate()}
          />
        )}
      </div>
    </div>
  );
};

interface TerminateButtonProps {
  className?: string;
  onClick: () => void;
}
const TerminateButton = ({
  className,
  onClick,
}: TerminateButtonProps): ReactElement => (
  <button
    className={classNames(
      "text-white",
      "transition-all",
      "duration-200",
      "hover:text-red-500",
      "active:text-red-500",
      "font-bold",
      className
    )}
    onClick={onClick}
  >
    x
  </button>
);

export interface RawPortraitProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "children"> {
  queryId?: number;
  size?: Size;
}
export const CharacterFacePortrait = ({
  className,
  ...props
}: RawPortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    className={classNames("portrait-face", className)}
    getQuery={(queryId, querySize) =>
      `https://images.evetech.net/characters/${queryId}/portrait?size=${querySize}`
    }
  />
);
export const CorporationFacePortrait = ({
  className,
  ...props
}: RawPortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    className={classNames("portrait-corporation", className)}
    getQuery={(queryId, querySize) =>
      `https://images.evetech.net/corporations/${queryId}/logo?size=${querySize}`
    }
  />
);
export const AllianceFacePortrait = ({
  className,
  ...props
}: RawPortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    className={classNames("portrait-alliance", className)}
    getQuery={(queryId, querySize) =>
      `https://images.evetech.net/alliances/${queryId}/logo?size=${querySize}`
    }
  />
);

interface InnerPortraitProps extends RawPortraitProps {
  getQuery: (queryId: number, querySize: number) => string;
}
const InnerPortrait = ({
  className,
  queryId,
  alt,
  getQuery,
  size = "auto",
  ...props
}: InnerPortraitProps): ReactElement => {
  const disabled = queryId === undefined || queryId < 0;
  if (disabled) {
    return <></>;
  } else {
    const querySize = QuerySizeMap[size];
    return (
      <img
        {...props}
        alt={alt ? alt : `${queryId}`}
        src={getQuery(queryId, querySize)}
        className={classNames(
          `size-${size}`,
          "portrait",
          "object-cover",
          className
        )}
        draggable={false}
      />
    );
  }
};
