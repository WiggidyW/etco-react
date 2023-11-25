import { ContractQueueEntry } from "@/server-actions/grpc/queue";
import { LoginCharacterPortrait } from "../Character/Portrait";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { FlexWrapMaxChildStyle } from "../FlexWrapMax";
import { FlattenedUserQueueEntry } from "./status";
import { ContractStatus } from "@/proto/etco";
import { Remaining } from "./Remaining";
import classNames from "classnames";
import Link from "next/link";
import {
  PropsWithChildren,
  ForwardedRef,
  ReactElement,
  forwardRef,
} from "react";
import { LocaleText, formatTime } from "../Appraisal/Util";

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
  strs: string[];
}
export const ContractCodeEntry = forwardRef(
  (
    {
      entry: {
        contract: { issued, expires, locationInfo, status },
        code,
        entity: { entity },
      },
      strs,
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
          <EntryInfo>
            {status === ContractStatus.CS_OUTSTANDING ? (
              <Remaining expiresUnix={expires} />
            ) : (
              <LocaleText fmt={formatTime} v={issued} />
            )}
          </EntryInfo>
          <EntryInfo>{strs[locationInfo!.locationStrIndex]}</EntryInfo>
          <EntryInfo>
            {strs[locationInfo!.systemInfo!.systemStrIndex]}
          </EntryInfo>
          <EntryInfo>
            {strs[locationInfo!.systemInfo!.regionStrIndex]}
          </EntryInfo>
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
