"use client";

import {
  Button,
  SelectInput,
  SelectOption,
  TextArea,
} from "../Input/Manipulator";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { ReactElement, useState } from "react";
import { Loading } from "../Loading";
import classNames from "classnames";

export interface PasteSubmitProps {
  className?: string;
  action: (text: string, systemId: number) => Promise<void>;
  options: { label: string; value: string }[];
}
export const PasteSubmit = ({
  action,
  className,
  options,
}: PasteSubmitProps): ReactElement => {
  //
  const PasteSubmitFormChildren = (): ReactElement => {
    const [system, setSystem] = useState<SelectOption<string> | null>(null);
    const [text, setText] = useState<string | null>(null);
    const { pending } = useFormStatus();

    const reset = () => {
      setSystem(null);
      setText(null);
    };

    return (
      <>
        {pending && (
          <div className={classNames("absolute", "inset-0", "z-30")}>
            <Loading scale="75%" />
          </div>
        )}
        <div className={classNames("flex-grow", "w-full")}>
          <TextArea
            value={text}
            setValue={setText}
            title="Paste Items"
            name="text"
            required
            wFull
            hFull
            disabled={pending}
          />
        </div>
        <div className={classNames("flex", "w-full")}>
          <span className={classNames("flex-shrink")}>
            <SelectInput
              value={system}
              setValue={setSystem}
              title="System"
              disabled={pending}
              name="systemId"
              options={options}
              required
              wFull
            />
          </span>
          <span className={classNames("ml-auto")} />
          <span
            className={classNames(
              "border",
              "border-light-red-base",
              "hover:border-light-red-active",
              "self-end",
              "ml-2"
            )}
          >
            <Button
              type="reset"
              disabled={pending}
              className={classNames("relative", "h-10", "p-0", "px-2")}
              onClick={reset}
            >
              Reset
            </Button>
          </span>
          <span
            className={classNames(
              "border",
              "border-light-blue-base",
              "hover:border-light-blue-active",
              "self-end",
              "ml-2"
            )}
          >
            <Button
              type="submit"
              disabled={pending}
              className={classNames("relative", "h-10", "p-0", "px-2")}
            >
              Submit
            </Button>
          </span>
        </div>
      </>
    );
  };

  return (
    <form
      className={classNames("relative", className)}
      action={(formData) => {
        const systemId = Number(formData.get("systemId") as string);
        const text = formData.get("text") as string;
        return action(text, systemId);
      }}
    >
      <PasteSubmitFormChildren />
    </form>
  );
};
