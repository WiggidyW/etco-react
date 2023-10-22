"use client";

import { ReactElement, useEffect, useMemo, useState } from "react";
import { ConstData } from "@/proto/etco";
import { Popup } from "@/components/Popup";
import classNames from "classnames";
import { Button, NumberInput, TextInput } from "../Input/Manipulator";
import { ContentPortal } from "@/components/Content";
import { CharacterSelection } from "../Character/Selection";
import { ConfigureBase } from "./Base";
import { resultCfgGetConstDataLoad } from "@/server-actions/grpc/cfgGet";
import { resultCfgSetConstData } from "@/server-actions/grpc/cfgMerge";

export interface ConfigureConstDataProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
  corporationCharactersKey: string;
  structureInfoCharactersKey: string;
}
export const ConfigureConstData = ({
  refreshToken,
  undoCap,
  redoCap,
  ...charKeys
}: ConfigureConstDataProps): ReactElement => (
  <ConfigureBase
    initial={{
      purchaseMaxActive: -1,
      makePurchaseCooldown: 0,
      cancelPurchaseCooldown: 0,
      corporationWebRefreshToken: "",
      structureInfoWebRefreshToken: "",
    }}
    refreshToken={refreshToken}
    actionLoad={(token) => resultCfgGetConstDataLoad(token)}
    actionMerge={(token, updated) => resultCfgSetConstData(token, updated)}
    deepClone={deepCloneConstData}
    mergeUpdates={mergeConstData}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({ update, updated, rep }) => (
      <Configure
        update={update}
        oldConstData={rep}
        newConstData={updated}
        {...charKeys}
      />
    )}
  </ConfigureBase>
);

const deepCloneConstData = (constData: ConstData): ConstData => ({
  ...constData,
});

const mergeConstData = (constData: ConstData, updates: ConstData): void => {
  Object.assign(constData, updates);
};

interface ConfigureProps {
  update: (update: ConstData) => void;
  oldConstData: ConstData;
  newConstData: ConstData;
  corporationCharactersKey: string;
  structureInfoCharactersKey: string;
}
const Configure = ({
  update,
  oldConstData,
  newConstData,
  ...charKeys
}: ConfigureProps): ReactElement => {
  useEffect(() => {
    if (newConstData.purchaseMaxActive === -1) {
      update(oldConstData);
    }
  }, []);
  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator previous={newConstData} onSave={update} {...charKeys} />
    </div>
  );
};

const fmtSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ");
};

interface ManipulatorProps {
  previous: ConstData;
  onSave: (update: ConstData) => void;
  corporationCharactersKey: string;
  structureInfoCharactersKey: string;
}
const Manipulator = ({
  previous: {
    purchaseMaxActive: prevPurchaseMaxActive,
    makePurchaseCooldown: prevMakePurchaseCooldown,
    cancelPurchaseCooldown: prevCancelPurchaseCooldown,
    corporationWebRefreshToken: prevCorporationWebRefreshToken,
    structureInfoWebRefreshToken: prevStructureInfoWebRefreshToken,
  },
  corporationCharactersKey,
  structureInfoCharactersKey,
  onSave,
}: ManipulatorProps): ReactElement => {
  const [selectingCharacter, setSelectingCharacter] = useState<
    "corp" | "struct" | null
  >(null);
  const [_purchaseMaxActive, setPurchaseMaxActive] = useState<number | null>(
    null
  );
  const [_makePurchaseCooldown, setMakePurchaseCooldown] = useState<
    number | null
  >(null);
  const [_cancelPurchaseCooldown, setCancelPurchaseCooldown] = useState<
    number | null
  >(null);
  const [_corporationWebRefreshToken, setCorporationWebRefreshToken] = useState<
    string | null
  >(null);
  const [_structureInfoWebRefreshToken, setStructureInfoWebRefreshToken] =
    useState<string | null>(null);

  let selectingChar: null | { key: string; setToken: (token: string) => void };
  switch (selectingCharacter) {
    case null:
      selectingChar = null;
      break;
    case "corp":
      selectingChar = {
        key: corporationCharactersKey,
        setToken: setCorporationWebRefreshToken,
      };
      break;
    case "struct":
      selectingChar = {
        key: structureInfoCharactersKey,
        setToken: setStructureInfoWebRefreshToken,
      };
      break;
  }

  const purchaseMaxActive = _purchaseMaxActive ?? prevPurchaseMaxActive;
  const makePurchaseCooldown =
    _makePurchaseCooldown ?? prevMakePurchaseCooldown;
  const cancelPurchaseCooldown =
    _cancelPurchaseCooldown ?? prevCancelPurchaseCooldown;
  const corporationWebRefreshToken =
    _corporationWebRefreshToken ?? prevCorporationWebRefreshToken;
  const structureInfoWebRefreshToken =
    _structureInfoWebRefreshToken ?? prevStructureInfoWebRefreshToken;

  console.log(
    prevPurchaseMaxActive,
    purchaseMaxActive,
    prevMakePurchaseCooldown,
    makePurchaseCooldown,
    prevCancelPurchaseCooldown,
    cancelPurchaseCooldown,
    prevCorporationWebRefreshToken,
    corporationWebRefreshToken,
    prevStructureInfoWebRefreshToken,
    structureInfoWebRefreshToken
  );

  const savePossible =
    purchaseMaxActive !== prevPurchaseMaxActive ||
    makePurchaseCooldown !== prevMakePurchaseCooldown ||
    cancelPurchaseCooldown !== prevCancelPurchaseCooldown ||
    corporationWebRefreshToken !== prevCorporationWebRefreshToken ||
    structureInfoWebRefreshToken !== prevStructureInfoWebRefreshToken;

  const fmtPrevMakePurchaseCooldown = fmtSeconds(prevMakePurchaseCooldown);
  const fmtPrevCancelPurchaseCooldown = fmtSeconds(prevCancelPurchaseCooldown);

  return (
    <>
      {selectingChar && (
        <ContentPortal>
          <Popup
            percentage="80"
            onClickOutside={() => setSelectingCharacter(null)}
          >
            <CharacterSelection
              charactersKey={selectingChar.key}
              onSelect={(character) => {
                selectingChar?.setToken(character.refreshToken);
                setSelectingCharacter(null);
              }}
            />
          </Popup>
        </ContentPortal>
      )}
      <div className={classNames("flex", "justify-center")}>
        <div className={classNames("inline-flex", "flex-col", "space-y-4")}>
          {/* Purchase Max Active input */}
          <NumberInput
            min={0}
            max={1000}
            title={`Max Active Purchases (prev: ${prevPurchaseMaxActive})`}
            value={purchaseMaxActive}
            setValue={setPurchaseMaxActive}
          />

          {/* Make Purchase Cooldown input */}
          <NumberInput
            min={0}
            title={`Make Purchase Cooldown (prev: ${fmtPrevMakePurchaseCooldown})`}
            value={makePurchaseCooldown}
            setValue={setMakePurchaseCooldown}
          />

          {/* Cancel Purchase Cooldown input */}
          <NumberInput
            min={0}
            title={`Cancel Purchase Cooldown (prev: ${fmtPrevCancelPurchaseCooldown})`}
            value={cancelPurchaseCooldown}
            setValue={setCancelPurchaseCooldown}
          />

          {/* Corporation Web Refresh Token input */}
          <Button
            variant="lightblue"
            disabled={selectingCharacter !== null}
            onClick={() => setSelectingCharacter("corp")}
          >
            {`Corp Token (prev: ${prevCorporationWebRefreshToken})`}
          </Button>

          {/* Structure Info Web Refresh Token input */}
          <Button
            variant="lightblue"
            disabled={selectingCharacter !== null}
            onClick={() => setSelectingCharacter("struct")}
          >
            {`Structure Info Token (prev: ${prevStructureInfoWebRefreshToken})`}
          </Button>

          {/* Save button */}
          <Button
            variant="success"
            disabled={!savePossible}
            onClick={() =>
              savePossible &&
              onSave({
                purchaseMaxActive,
                makePurchaseCooldown,
                cancelPurchaseCooldown,
                corporationWebRefreshToken,
                structureInfoWebRefreshToken,
              })
            }
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
};
