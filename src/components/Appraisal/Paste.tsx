"use client";

import {
  Button,
  SelectInput,
  SelectOption,
  TextArea,
} from "../Input/Manipulator";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { ReactElement, useCallback } from "react";
import { Loading } from "../Loading";
import classNames from "classnames";

interface PasteBaseProps {
  options: { label: string; value: string }[];
  text: string | null;
  setText: (text: string | null) => void;
  submitButtonTitle?: string;
}

export interface PasteParseProps extends PasteBaseProps {
  className?: string;
  action: (text: string) => Promise<void>;
}
export const PasteParse = ({
  action,
  className,
  setText,
  ...formContentProps
}: PasteParseProps): ReactElement => {
  const resetState = useCallback(() => setText(null), [setText]);

  const formAction = useCallback(
    (formData: FormData) => {
      const text = formData.get("text") as string;
      return action(text);
    },
    [action]
  );

  return (
    <form className={classNames("relative", className)} action={formAction}>
      <PasteFormContent
        {...formContentProps}
        resetState={resetState}
        setText={setText}
      />
    </form>
  );
};

export interface PasteSubmitProps extends PasteBaseProps {
  className?: string;
  action: (text: string, systemId: number) => Promise<void>;
  system: SelectOption<string> | null;
  setSystem: (system: SelectOption<string> | null) => void;
}
export const PasteSubmit = ({
  action,
  className,
  system,
  setSystem,
  setText,
  ...formContentProps
}: PasteSubmitProps): ReactElement => {
  const resetState = useCallback(() => {
    setSystem(null);
    setText(null);
  }, [setSystem, setText]);

  const formAction = useCallback(
    (formData: FormData) => {
      const systemId = Number(formData.get("systemId") as string);
      const text = formData.get("text") as string;
      return action(text, systemId);
    },
    [action]
  );

  return (
    <form className={classNames("relative", className)} action={formAction}>
      <PasteFormContent
        {...formContentProps}
        resetState={resetState}
        setText={setText}
        systemProps={{ system, setSystem }}
      />
    </form>
  );
};

interface PasteFormContentProps extends PasteBaseProps {
  resetState: () => void;
  systemProps?: {
    system: SelectOption<string> | null;
    setSystem: (system: SelectOption<string> | null) => void;
  };
}
const PasteFormContent = ({
  resetState,
  options,
  text,
  setText,
  systemProps,
  submitButtonTitle = systemProps ? "Appraise" : "Add",
}: PasteFormContentProps): ReactElement => {
  const { pending } = useFormStatus();
  const submitDisabled =
    pending || !text || (systemProps && !systemProps.system);

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
      <div
        className={classNames("flex", "w-full", {
          "justify-center": !systemProps,
        })}
      >
        {systemProps && (
          <>
            <span className={classNames("flex-shrink")}>
              <SelectInput
                value={systemProps.system}
                setValue={systemProps.setSystem}
                title="System"
                disabled={pending}
                name="systemId"
                options={options}
                required
                wFull
              />
            </span>
            <span className={classNames("ml-auto")} />
          </>
        )}
        <span
          className={classNames(
            "border",
            "border-light-red-base",
            "hover:border-light-red-active",
            "self-end",
            { "ml-2": systemProps }
          )}
        >
          <Button
            type="reset"
            disabled={pending}
            className={classNames("relative", "h-10", "p-0", "px-2")}
            onClick={resetState}
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
            disabled={submitDisabled}
            className={classNames("relative", "h-10", "p-0", "px-2")}
          >
            {submitButtonTitle}
          </Button>
        </span>
      </div>
    </>
  );
};
