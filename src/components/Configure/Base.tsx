"use client";

import { ReactElement, ReactNode, Suspense, useMemo, useState } from "react";
import { CfgMergeResponse } from "@/proto/interfaces";
import { useUndoRedoCurrent } from "./buffer";
import { ErrorBoundaryTryAgain } from "../ErrorBoundary";
import { Loading } from "../Loading";
import { MessagePopup } from "../Popup";
import { ContentBookend, VerticalBookend } from "../Bookend";
import classNames from "classnames";
import { useBrowserContext } from "@/browser/context";
import { useServerAction } from "@/server-actions/util";
import { FooterButton } from "../Input/FooterButton";
import { ContentPortal } from "../Content";

export interface PartialConfigureChildArgs<GET> {
  rep: GET;
}

interface ConfigureChildArgs<CFG, GET> {
  rep: GET;
  // these three words are very similar, and yet I feel they explain themselves
  updated: CFG;
  update: (updates: CFG) => void;
}

export interface ConfigureBaseProps<
  CFG extends {},
  MRG extends CfgMergeResponse,
  GET
> {
  initial: CFG;
  refreshToken: string;
  actionLoad: (refreshToken: string) => Promise<GET>;
  actionMerge: (refreshToken: string, updated: CFG) => Promise<MRG>;
  mergeUpdates: (cfg: CFG, updates: CFG) => void;
  deepClone: (cfg: CFG) => CFG;
  undoCap?: number;
  redoCap?: number;
  children?: (args: ConfigureChildArgs<CFG, GET>) => ReactNode;
}
enum Status {
  Loading = "loading",
  Configuring = "configuring",
  Committing = "committing",
}
export const ConfigureBase = <
  CFG extends {},
  MRG extends CfgMergeResponse,
  GET
>({
  initial,
  refreshToken,
  actionLoad,
  actionMerge,
  mergeUpdates,
  deepClone,
  undoCap = 3,
  redoCap = 3,
  children,
}: ConfigureBaseProps<CFG, MRG, GET>): ReactElement => {
  const {
    current: updated,
    setCurrent: setUpdated,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useUndoRedoCurrent<CFG>(initial, undoCap, redoCap);
  const [status, setStatus] = useState<Status>(Status.Loading);
  const browserCtx = useBrowserContext();

  const setLoading = () => setStatus(Status.Loading);
  const setConfiguring = () => setStatus(Status.Configuring);
  const setCommitting = () => setStatus(Status.Committing);
  // const isLoading = status === Status.Loading;
  const isConfiguring = status === Status.Configuring;
  const isCommitting = status === Status.Committing;

  const update = (updates: CFG): void => {
    const newUpdated = deepClone(updated);
    mergeUpdates(newUpdated, updates);
    setUpdated(newUpdated);
  };

  if (browserCtx === null) {
    return <></>;
  } else {
    return (
      <ContentBookend
        bookendPosition="bottom"
        bookend={
          <Footer
            canCommit={isConfiguring && Object.keys(updated).length > 0}
            onCommit={() => setCommitting()}
            canUndo={isConfiguring && canUndo}
            onUndo={undo}
            canRedo={isConfiguring && canRedo}
            onRedo={redo}
          />
        }
      >
        <Suspense
          fallback={
            <ContentPortal>
              <Loading scale="25%" />
            </ContentPortal>
          }
        >
          <ErrorBoundaryTryAgain>
            {isCommitting ? (
              <Commit
                actionMerge={() => actionMerge(refreshToken, updated)}
                onFinish={() => {
                  reset();
                  setLoading();
                }}
              />
            ) : (
              <Load
                actionLoad={() =>
                  actionLoad(refreshToken).then((rep) => {
                    setConfiguring();
                    return rep;
                  })
                }
              >
                {({ rep }) => children && children({ rep, updated, update })}
              </Load>
            )}
          </ErrorBoundaryTryAgain>
        </Suspense>
      </ContentBookend>
    );
  }
};

interface CommitProps<MRG extends CfgMergeResponse> {
  actionMerge: () => Promise<MRG>;
  onFinish: () => void;
}
const Commit = <MRG extends CfgMergeResponse>({
  actionMerge,
  onFinish,
}: CommitProps<MRG>): ReactElement => {
  const rep = useServerAction(actionMerge);
  if (rep.some) {
    return (
      <MessagePopup
        title="Update Successful"
        message={`Modified: ${rep.value.modified}`}
        onClickOutside={onFinish}
      />
    );
  } else {
    return <></>;
  }
};

interface LoadProps<GET> {
  actionLoad: () => Promise<GET>;
  children?: (args: { rep: GET }) => ReactNode;
}
const Load = <GET,>({ actionLoad, children }: LoadProps<GET>): ReactElement => {
  const rep = useServerAction(actionLoad);
  if (rep.some) {
    return <>{children && children({ rep: rep.value })}</>;
  } else {
    return <></>;
  }
};

interface FooterProps {
  canCommit: boolean;
  onCommit: () => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
}
const Footer = ({
  canCommit,
  onCommit,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
}: FooterProps): ReactElement => (
  <VerticalBookend
    height={undefined}
    className={classNames("flex", "items-center", "justify-center")}
  >
    <FooterButton canClick={canUndo} onClick={onUndo}>
      Undo
    </FooterButton>
    <FooterButton canClick={canCommit} onClick={onCommit}>
      Commit
    </FooterButton>
    <FooterButton canClick={canRedo} onClick={onRedo}>
      Redo
    </FooterButton>
  </VerticalBookend>
);
