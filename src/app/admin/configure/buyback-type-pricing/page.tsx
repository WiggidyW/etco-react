"use client";

import { CurrentCharacterProps, PageAdmin } from "@/components/Page/PageAdmin";
import { useCfgGetBuybackSystemTypeMapsBuilder } from "@/proto/rpc_hooks";
import { Loading } from "@/components/Loading";
import { Popup } from "@/components/Popup";
import { Rect } from "@/components/dims";
import { ReactElement } from "react";
import {
  CfgBuybackSystemTypeBundle,
  CfgGetBuybackSystemTypeMapsBuilderResponse,
} from "@/proto/etco";

const PATH = "/admin/configure/buyback-type-pricing";

export default function Page(): ReactElement {
  return (
    <PageAdmin path={PATH}>
      {(fwdprops) => <AdminConfigureAuth {...fwdprops} />}
    </PageAdmin>
  );
}

interface AdminConfigureAuthProps extends Rect, CurrentCharacterProps {}

interface BuilderWithUniqueBundleKeys<B> {
  builder: { [typeId: number]: B };
  bundleKeys: Set<string>;
}

type BuybackBuilderWithUniqueBundleKeys =
  BuilderWithUniqueBundleKeys<CfgBuybackSystemTypeBundle>;

const withUniqueBundleKeys = (
  rep: CfgGetBuybackSystemTypeMapsBuilderResponse
): BuybackBuilderWithUniqueBundleKeys => {
  const bundleKeys = new Set<string>();
  for (const typeId in rep.builder) {
    for (const bundleKey in rep.builder[typeId].inner) {
      bundleKeys.add(bundleKey);
    }
  }
  return { builder: rep.builder, bundleKeys };
};

const AdminConfigureAuth = ({
  currentCharacter,
  ...contentRect
}: AdminConfigureAuthProps): ReactElement => {
  const { rep, error } = useCfgGetBuybackSystemTypeMapsBuilder(
    currentCharacter.id,
    withUniqueBundleKeys
  );
  if (rep !== null) {
    return (
      <Popup
        contentRect={contentRect}
        title="Success"
        message={JSON.stringify(rep, null, 2)}
      />
    );
  } else if (error !== null) {
    return (
      <Popup
        contentRect={contentRect}
        title="Error"
        message={error.toString()}
      />
    );
  } else {
    return <Loading parentDims={contentRect} />;
  }
};
