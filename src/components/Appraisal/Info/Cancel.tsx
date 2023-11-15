"use client";

import { ICharacter } from "@/browser/character";
import { useBrowserContext } from "@/browser/context";
import { Button } from "@/components/Input/Manipulator";
import { Loading } from "@/components/Loading";
import { Result, ResultThrow } from "@/components/todo";
import {
  resultCancelPurchase,
  resultDelPurchases,
} from "@/server-actions/grpc/other";
import classNames from "classnames";
import { ReactNode, useCallback, useState } from "react";

export interface CancelButtonProps {
  character: ICharacter;
  code: string;
}
export const CancelButton = ({
  character,
  code,
}: CancelButtonProps): ReactNode => {
  const ctx = useBrowserContext();
  const [clicked, setClicked] = useState<boolean>(false);
  const action = useCallback(async () => {
    let method: (code: string, token: string) => Promise<Result<{}, unknown>>;
    if (character.admin) {
      method = (code, token) => resultDelPurchases([code], token);
    } else {
      method = resultCancelPurchase;
    }
    await method(code, character.refreshToken).then((res) => ResultThrow(res));
    if (ctx !== null) window.location.reload();
  }, [character, code, ctx]);
  if (ctx === null) return null;
  return (
    <tr>
      <td colSpan={2}>
        <div className={classNames("flex", "justify-center")}>
          <Button variant="failure" onClick={action} disabled={clicked}>
            {clicked ? <Loading /> : "Cancel"}
          </Button>
        </div>
      </td>
    </tr>
  );
};
