import { StoreKind } from "@/server-actions/grpc/grpc";
import { ContractStatus as PBContractStatus } from "@/proto/etco";
import {
  ContractQueueEntry,
  UserQueueEntry,
} from "@/server-actions/grpc/queue";

export const ContractStatusTabs = [
  "Outstanding",
  "Outstanding (Hidden)",
  "Cancelled by User",
  "Cancelled by Corp",
  "Completed",
  "Timed Out",
  "Deleted",
  "Other",
] as const;

export type ContractStatusTab = (typeof ContractStatusTabs)[number];
export type AppraisalStatusTab =
  | ContractStatusTab
  | "In Purchase Queue"
  | "Undefined";

export interface GroupedContractQueue {
  outstanding: ContractQueueEntry[];
  outstandingHidden: ContractQueueEntry[];
  cancelledByUser: ContractQueueEntry[];
  cancelledByCorp: ContractQueueEntry[];
  completed: ContractQueueEntry[];
  timedOut: ContractQueueEntry[];
  deleted: ContractQueueEntry[];
  other: ContractQueueEntry[];
}

export interface FlattenedUserQueueEntry {
  status: AppraisalStatusTab;
  code: string;
  expires?: number;
}

export const getGroupEntries = (
  queue: GroupedContractQueue,
  tab: (typeof ContractStatusTabs)[number]
): ContractQueueEntry[] => {
  switch (tab) {
    case "Outstanding":
      return queue.outstanding;
    case "Outstanding (Hidden)":
      return queue.outstandingHidden;
    case "Cancelled by User":
      return queue.cancelledByUser;
    case "Cancelled by Corp":
      return queue.cancelledByCorp;
    case "Completed":
      return queue.completed;
    case "Timed Out":
      return queue.timedOut;
    case "Deleted":
      return queue.deleted;
    case "Other":
      return queue.other;
  }
};

export const newGroupedContractQueue = (
  kind: StoreKind,
  entries: ContractQueueEntry[]
): GroupedContractQueue => {
  const groupedQueue: GroupedContractQueue = {
    outstanding: [],
    outstandingHidden: [],
    cancelledByUser: [],
    cancelledByCorp: [],
    completed: [],
    timedOut: [],
    deleted: [],
    other: [],
  };
  for (const entry of entries) {
    pushGroupEntry(kind, groupedQueue, entry);
  }
  return groupedQueue;
};

export const newFlattenedUserQueue = (
  kind: StoreKind,
  entries: UserQueueEntry[]
): FlattenedUserQueueEntry[] =>
  entries.map((entry) => ({
    status: getAppraisalStatusTab(kind, entry),
    code: entry.code,
    ...(entry.status !== null && entry.status !== "inPurchaseQueue"
      ? { expires: entry.status.expires }
      : {}),
  }));

const getAppraisalStatusTab = (
  kind: StoreKind,
  entry: UserQueueEntry
): AppraisalStatusTab => {
  if (entry.status === null) {
    return "Undefined";
  } else if (entry.status === "inPurchaseQueue") {
    return "In Purchase Queue";
  } else {
    return getStatusTab(kind, entry.status.status);
  }
};

const getStatusTab = (
  kind: StoreKind,
  pbStatus: PBContractStatus
): ContractStatusTab => {
  switch (pbStatus) {
    case PBContractStatus.outstanding:
      return "Outstanding";
    case PBContractStatus.finished:
      return "Completed";
    case PBContractStatus.cancelled:
      return kind === "buyback" ? "Cancelled by User" : "Cancelled by Corp";
    case PBContractStatus.rejected:
      return kind === "shop" ? "Cancelled by User" : "Cancelled by Corp";
    case PBContractStatus.failed:
      return "Timed Out";
    case PBContractStatus.deleted:
      return "Deleted";
    // case PBContractStatus.unknown_status:
    // case PBContractStatus.in_progress:
    // case PBContractStatus.finished_issuer:
    // case PBContractStatus.finished_contractor:
    // case PBContractStatus.reversed:
    default:
      return "Other";
  }
};

const pushGroupEntry = (
  kind: StoreKind,
  queue: GroupedContractQueue,
  entry: ContractQueueEntry
): number => {
  const tab = getStatusTab(kind, entry.contract.status);
  return getGroupEntries(queue, tab).push(entry);
};
