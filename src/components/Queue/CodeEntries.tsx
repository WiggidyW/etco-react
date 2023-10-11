"use client";

import { LocationNamingMaps } from "@/proto/etco";
import { ContractQueueEntry } from "@/server-actions/grpc/queue";
import { FlexWrapMax, FlexWrapMaxChildArgs } from "../FlexWrapMax";
import classNames from "classnames";
import {
  ContractCodeEntry,
  PurchaseCodeEntry,
  UserCodeEntry,
} from "./CodeEntry";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { FlattenedUserQueueEntry } from "./status";
import { ReactElement } from "react";

export interface UserCodeEntriesProps {
  className?: string;
  kind: StoreKind;
  entries: FlattenedUserQueueEntry[];
}
export const UserCodeEntries = ({
  className,
  kind,
  entries,
}: UserCodeEntriesProps): ReactElement => (
  <FlexWrapMax
    className={classNames("justify-center", className)}
    childFuncs={Array.from(
      (function* () {
        for (const entry of entries) {
          yield (args: FlexWrapMaxChildArgs<HTMLAnchorElement>) => (
            <UserCodeEntry
              className={classNames("mt-1", "ml-0.5", "mr-0.5")}
              kind={kind}
              entry={entry}
              {...args}
            />
          );
        }
      })()
    )}
  />
);

export interface PurchaseCodeEntriesProps {
  className?: string;
  entries: string[];
}
export const PurchaseCodeEntries = ({
  className,
  entries,
}: PurchaseCodeEntriesProps): ReactElement => (
  <FlexWrapMax
    className={classNames("justify-center", className)}
    childFuncs={Array.from(
      (function* () {
        for (const entry of entries) {
          yield (args: FlexWrapMaxChildArgs<HTMLAnchorElement>) => (
            <PurchaseCodeEntry
              className={classNames("mt-1", "ml-0.5", "mr-0.5")}
              code={entry}
              {...args}
            />
          );
        }
      })()
    )}
  />
);

export interface ContractCodeEntriesProps {
  className?: string;
  kind: StoreKind;
  locationNamingMaps: LocationNamingMaps;
  entries: ContractQueueEntry[];
}
export const ContractCodeEntries = ({
  className,
  kind,
  locationNamingMaps,
  entries,
}: ContractCodeEntriesProps): ReactElement => (
  <FlexWrapMax
    className={classNames("justify-center", className)}
    childFuncs={Array.from(
      (function* () {
        for (const entry of entries) {
          yield (args: FlexWrapMaxChildArgs<HTMLAnchorElement>) => (
            <ContractCodeEntry
              className={classNames("mt-1", "ml-0.5", "mr-0.5")}
              kind={kind}
              entry={entry}
              locationNamingMaps={locationNamingMaps}
              {...args}
            />
          );
        }
      })()
    )}
  />
);
