"use client";

import {
  Button,
  IntrinsicTextAreaProps,
  SelectInput,
  SelectOption,
  TextArea,
} from "../Input/Manipulator";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { PropsWithChildren, ReactElement, memo, useCallback } from "react";
import { Loading } from "../Loading";
import classNames from "classnames";
import { NextLinkProps } from "../todo";
import Link from "next/link";

export interface PasteFormProps extends Omit<PasteContentProps, "linkProps"> {
  className?: string;
  action: (text: string, territoryId: number) => Promise<void>;
}
export const PasteForm = ({
  action,
  className,
  ...formContentProps
}: PasteFormProps): ReactElement => {
  const formAction = useCallback(
    (formData: FormData) => {
      const territoryId = Number(formData.get("territoryId") as string);
      const text = formData.get("text") as string;
      return action(text, territoryId);
    },
    [action]
  );

  return (
    <form className={classNames("relative", className)} action={formAction}>
      <PasteContent {...formContentProps} />
    </form>
  );
};

export interface PasteLinkProps extends Omit<PasteContentProps, "linkProps"> {
  className?: string;
  linkProps: NextLinkProps;
}
export const PasteLink = ({
  className,
  ...formContentProps
}: PasteLinkProps): ReactElement => {
  return (
    <div className={classNames("relative", className)}>
      <PasteContent {...formContentProps} />
    </div>
  );
};

interface PasteContentProps {
  text: string | null;
  setText: (text: string | null) => void;
  territory: SelectOption<string> | null;
  setTerritory: (territory: SelectOption<string> | null) => void;
  options: SelectOption<string>[];
  textRequired?: boolean;
  territoryTitle?: string;
  submitTitle?: string;
  pasteTitle?: string;
  linkProps?: NextLinkProps;
  intrinsicTextAreaProps?: IntrinsicTextAreaProps;
}
const PasteContent = ({
  text,
  setText,
  territory,
  setTerritory,
  options,
  textRequired = false,
  territoryTitle = "Territory",
  submitTitle = "Submit",
  pasteTitle = "Paste Items",
  linkProps,
  intrinsicTextAreaProps,
}: PasteContentProps): ReactElement => {
  const { pending } = useFormStatus();
  const submitDisabled = pending || !territory || (textRequired && !text);

  const resetState = useCallback(() => {
    setTerritory(null);
    setText(null);
  }, [setTerritory, setText]);

  return (
    <>
      {pending && (
        <div className={classNames("absolute", "inset-0", "z-30")}>
          <Loading scale="75%" />
        </div>
      )}
      <div className={classNames("flex-grow", "w-full")}>
        <TextArea
          intrinsicProps={intrinsicTextAreaProps}
          value={text}
          setValue={setText}
          title={pasteTitle}
          name="text"
          required={textRequired}
          wFull
          hFull
          disabled={pending}
        />
      </div>
      <div className={classNames("flex", "w-full")}>
        <span className={classNames("flex-shrink")}>
          <SelectInput
            value={territory}
            setValue={setTerritory}
            title={territoryTitle}
            disabled={pending}
            name="territoryId"
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
            className={classNames("h-10", "p-0", "px-2")}
            onClick={resetState}
          >
            Reset
          </Button>
        </span>
        <SubmitParent
          className={classNames(
            "border",
            "border-light-blue-base",
            "self-end",
            "ml-2",
            submitDisabled
              ? "hover:border-light-blue-faded"
              : "hover:border-light-blue-active"
          )}
          linkProps={linkProps}
        >
          <Button
            type="submit"
            disabled={submitDisabled}
            className={classNames("h-10", "p-0", "px-2")}
          >
            {submitTitle}
          </Button>
        </SubmitParent>
      </div>
    </>
  );
};

interface SubmitParentProps extends PropsWithChildren {
  className?: string;
  linkProps?: NextLinkProps;
}
const SubmitParent = ({
  className,
  linkProps,
  children,
}: SubmitParentProps): ReactElement => {
  if (linkProps) {
    return (
      <Link {...linkProps} className={className}>
        {children}
      </Link>
    );
  } else {
    return <span className={className}>{children}</span>;
  }
};
