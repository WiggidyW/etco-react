import { ContractQueueEntry } from "@/server-actions/grpc/queue";
import { LoginCharacterPortrait } from "../Character/Portrait";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { FlexWrapMaxChildStyle } from "../FlexWrapMax";
import { FlattenedUserQueueEntry } from "./status";
import { LocationNamingMaps } from "@/proto/etco";
import { Remaining } from "./Remaining";
import classNames from "classnames";
import Link from "next/link";
import {
  PropsWithChildren,
  ForwardedRef,
  ReactElement,
  forwardRef,
} from "react";

export interface UserCodeEntryProps extends FlexWrapMaxChildStyle {
  className?: string;
  kind: StoreKind;
  entry: FlattenedUserQueueEntry;
}
export const UserCodeEntry = forwardRef(
  (
    {
      className,
      kind,
      entry: { code, status },
      ...linkProps
    }: UserCodeEntryProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ): ReactElement => (
    <EntryLinkWrapper
      ref={ref}
      className={classNames(
        "bg-primary-base",
        "flex",
        "flex-col",
        "p-1",
        className
      )}
      code={code}
      kind={kind}
      {...linkProps}
    >
      <Code>{code}</Code>
      {status}
    </EntryLinkWrapper>
  )
);

export interface PurchaseCodeEntryProps extends FlexWrapMaxChildStyle {
  className?: string;
  code: string;
}
export const PurchaseCodeEntry = forwardRef(
  (
    { code, className, ...linkProps }: PurchaseCodeEntryProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ): ReactElement => (
    <EntryLinkWrapper
      ref={ref}
      className={classNames("bg-primary-base", "p-1", className)}
      code={code}
      kind="shop"
      {...linkProps}
    >
      <Code>{code}</Code>
    </EntryLinkWrapper>
  )
);

export interface ContractCodeEntryProps extends FlexWrapMaxChildStyle {
  className?: string;
  kind: StoreKind;
  entry: ContractQueueEntry;
  locationNamingMaps: LocationNamingMaps;
}
export const ContractCodeEntry = forwardRef(
  (
    {
      entry: {
        contract: { expires, locationId },
        locationInfo: { systemId, regionId },
        code,
        entity: { entity },
      },
      locationNamingMaps: { locationNames, systemNames, regionNames },
      className,
      ...linkProps
    }: ContractCodeEntryProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ): ReactElement => (
    <EntryLinkWrapper
      ref={ref}
      className={classNames(
        "bg-primary-base",
        "flex",
        "flex-col",
        "p-1",
        className
      )}
      code={code}
      {...linkProps}
    >
      <Code className={classNames("pl-2")}>{code}</Code>
      <LoginCharacterPortrait
        character={entity}
        size={"lg"}
        loginEffect={false}
        nameBarSize="auto"
        // nameBarMinFit
      >
        <div
          className={classNames("inline-flex", "flex-col", "justify-evenly")}
        >
          <EntryInfo>{<Remaining expiresUnix={expires} />}</EntryInfo>
          <EntryInfo>{locationNames[locationId]}</EntryInfo>
          <EntryInfo>{systemNames[systemId]}</EntryInfo>
          <EntryInfo>{regionNames[regionId]}</EntryInfo>
        </div>
      </LoginCharacterPortrait>
    </EntryLinkWrapper>
  )
);

interface EntryLinkWrapperProps
  extends PropsWithChildren,
    FlexWrapMaxChildStyle {
  className?: string;
  kind: StoreKind;
  code: string;
}
const EntryLinkWrapper = forwardRef(
  (
    {
      kind,
      code,
      children,
      minWidth,
      minHeight,
      ...linkProps
    }: EntryLinkWrapperProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ): ReactElement => (
    <Link
      href={`/${kind}/${code}`}
      ref={ref}
      {...linkProps}
      style={{ minWidth, minHeight }}
    >
      {children}
    </Link>
  )
);

interface CodeProps extends PropsWithChildren {
  className?: string;
}
const Code = ({ className, children }: CodeProps): ReactElement => (
  <span className={classNames("text-lg", "font-bold", className)}>
    {children}
  </span>
);

const EntryInfo = ({ children }: PropsWithChildren): ReactElement => (
  <span className={classNames("text-sm", "pl-1", "whitespace-nowrap")}>
    {children}
  </span>
);

// I guess it's because of forwardRef that the nextJS compiler needs this
UserCodeEntry.displayName = "UserCodeEntry";
PurchaseCodeEntry.displayName = "PurchaseCodeEntry";
ContractCodeEntry.displayName = "ContractCodeEntry";
EntryLinkWrapper.displayName = "EntryLinkWrapper";
