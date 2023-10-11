"use client";

import { LocationNamingMaps } from "@/proto/etco";
import { ContractQueueEntry } from "@/server-actions/grpc/queue";
import { ReactElement, useState } from "react";
import classNames from "classnames";
import { Tab } from "../Tab";
import {
  ContractCodeEntries,
  PurchaseCodeEntries,
  UserCodeEntries,
} from "./CodeEntries";
import {
  FlattenedUserQueueEntry,
  GroupedContractQueue,
  getGroupEntries,
} from "./status";
import { StoreKind } from "@/server-actions/grpc/grpc";
import { InfoRow, InfoTable } from "../Appraisal/Info/Shared";
import { LocaleText, formatTime } from "../Appraisal/Util";

const Tabs = [
  "Outstanding",
  "Outstanding (Hidden)",
  "Cancelled by User",
  "Cancelled by Corp",
  "Completed",
  "Timed Out",
  "Other",
] as const;

export interface PurchaseQueueViewerProps {
  queue: string[];
}
export const PurchaseQueueViewer = ({
  queue,
}: PurchaseQueueViewerProps): ReactElement => {
  return <PurchaseCodeEntries entries={queue} className={classNames("mt-1")} />;
};

export interface ContractQueueViewerProps {
  kind: StoreKind;
  locationNamingMaps: LocationNamingMaps;
  queue: GroupedContractQueue;
}
export const ContractQueueViewer = ({
  kind,
  locationNamingMaps,
  queue: initialQueue,
}: ContractQueueViewerProps): ReactElement => {
  const [queue, setQueue] = useState<GroupedContractQueue>(initialQueue);
  const [tab, setTab] = useState(0);
  return (
    <div className={classNames("flex", "flex-col", "justify-center")}>
      <div className={classNames("flex", "justify-center", "space-x-1")}>
        {Tabs.map((tabName, i) => (
          <Tab
            key={i}
            active={i === tab}
            connect="top"
            onClick={() => setTab(i)}
            className={classNames({
              hidden:
                tabName !== "Outstanding" &&
                getGroupEntries(queue, tabName).length === 0,
            })}
          >
            {tabName}
          </Tab>
        ))}
      </div>
      <ContractCodeEntries
        kind={kind}
        entries={getGroupEntries(queue, Tabs[tab])}
        locationNamingMaps={locationNamingMaps}
        className={classNames("mt-2")}
      />
    </div>
  );
};

export interface UserQueueViewerProps {
  buybackHistory: FlattenedUserQueueEntry[];
  shopHistory: FlattenedUserQueueEntry[];
  madePurchase: number;
  cancelledPurchase: number;
}
export const UserQueueViewer = ({
  buybackHistory,
  shopHistory,
  madePurchase,
  cancelledPurchase,
}: UserQueueViewerProps): ReactElement => {
  const [tab, setTab] = useState(0);
  const kind = tab === 0 ? "buyback" : "shop";
  const title = tab === 0 ? "Buyback History" : "Shop History";
  const history = tab === 0 ? buybackHistory : shopHistory;
  return (
    <>
      <div
        className={classNames(
          "flex",
          "justify-between",
          "min-w-min",
          "mr-1",
          "ml-1"
        )}
      >
        <div
          className={classNames(
            "flex",
            "h-min",
            "space-x-1",
            "basis-0",
            "flex-grow"
          )}
        >
          <Tab
            active={kind === "buyback"}
            connect="top"
            onClick={() => setTab(0)}
          >
            Buyback
          </Tab>
          <Tab active={kind === "shop"} connect="top" onClick={() => setTab(1)}>
            Shop
          </Tab>
        </div>
        <span
          className={classNames(
            "basis-0",
            "flex-grow",
            "whitespace-nowrap",
            "text-xl",
            "text-center",
            "mt-1",
            "ml-1",
            "mr-1"
          )}
        >
          {title}
        </span>
        <span className={classNames("basis-0", "flex-grow")}>
          {kind === "shop" && (madePurchase > 0 || cancelledPurchase > 0) && (
            <InfoTable
              className={classNames("mt-2", "basis-0", "flex-grow", "ml-auto")}
            >
              {madePurchase > 0 && (
                <InfoRow label="Made Purchase">
                  <LocaleText fmt={formatTime} v={madePurchase} />
                </InfoRow>
              )}
              {cancelledPurchase > 0 && (
                <InfoRow label="Cancelled Purchase">
                  <LocaleText fmt={formatTime} v={cancelledPurchase} />
                </InfoRow>
              )}
            </InfoTable>
          )}
        </span>
      </div>
      {history.length === 0 ? (
        <div className={classNames("text-center", "text-xl")}>
          No History Found
        </div>
      ) : (
        <UserCodeEntries
          className={classNames("mt-1")}
          kind={kind}
          entries={history}
        />
      )}
    </>
  );
};
