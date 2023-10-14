"use client";

import classNames from "classnames";
import {
  ChangeEvent,
  ReactElement,
  ClipboardEvent,
  FormEvent,
  ReactNode,
  useState,
  PropsWithChildren,
  useMemo,
  DragEvent,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import { AddAll, DelAll } from "../SVG";

interface InputContainerProps {
  title?: string;
  disabled?: boolean;
  wFull?: boolean;
  hFull?: boolean;
}
const InputContainer = ({
  title,
  disabled,
  wFull = false,
  hFull = false,
  children,
}: PropsWithChildren<InputContainerProps>): ReactElement => (
  <div
    className={classNames("flex", "flex-col", "items-center", {
      "opacity-50": disabled,
      "cursor-not-allowed": disabled,
      "w-full": wFull,
      "h-full": hFull,
    })}
  >
    {title && <label className={classNames()}>{title}</label>}
    {children}
  </div>
);

export type InputValue = string | ReadonlyArray<string> | number;

export interface SelectOption<V extends InputValue> {
  label: string;
  value: V;
}

export interface FormSelectInputProps<V extends InputValue>
  extends InputContainerProps {
  name?: string;
  options: SelectOption<V>[];
  required?: boolean;
}
export const FormSelectInput = <V extends InputValue>(
  props: FormSelectInputProps<V>
): ReactElement => {
  const [value, setValue] = useState<SelectOption<V> | null>(null);
  return <SelectInput {...props} value={value} setValue={setValue} />;
};

export interface SelectInputProps<V extends InputValue>
  extends FormSelectInputProps<V> {
  value: SelectOption<V> | null;
  setValue: (value: SelectOption<V> | null) => void;
}
export const SelectInput = <V extends InputValue>({
  options,
  title,
  name,
  value,
  setValue,
  disabled = false,
  required = false,
  hFull = false,
  wFull = false,
}: SelectInputProps<V>): ReactElement => {
  const [valueCopy, setValueCopy] = useState<SelectOption<V> | null>(value);
  const [label, setLabel] = useState<string>(value?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value?.value !== valueCopy?.value) {
      // value changed from outside, update label to reflect that
      setValueCopy(value);
      setLabel(value?.label ?? "");
    }
  }, [value, valueCopy]);

  const {
    labelOptionsMap,
    autoCompleteOptions,
  }: {
    labelOptionsMap: Map<string, SelectOption<V>>;
    autoCompleteOptions: ReactElement[];
  } = useMemo(() => {
    const labelOptionsMap = new Map<string, SelectOption<V>>();
    const autoCompleteOptions = new Array<ReactElement>(options.length);
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      labelOptionsMap.set(option.label, option);
      autoCompleteOptions[i] = <option key={i} value={option.label} />;
    }
    return { labelOptionsMap, autoCompleteOptions };
  }, [options]);

  const handleLocal = (l: string): void => {
    if (document.activeElement === inputRef.current) {
      setLabel(l);
    } else {
      handleGlobal(l);
    }
  };
  const handleGlobal = (l: string): void => {
    const option = labelOptionsMap.get(l);
    if (option) {
      setValueCopy(option);
      setValue(option);
    } else {
      setLabel("");
      setValueCopy(null);
      setValue(null);
    }
  };

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>) =>
    handleLocal(e.target.value);
  const handleBlurEvent = (e: ChangeEvent<HTMLInputElement>) =>
    handleGlobal(e.target.value);

  return (
    <InputContainer
      title={title}
      disabled={disabled}
      wFull={wFull}
      hFull={hFull}
    >
      <div
        className={classNames("relative", {
          "w-full": wFull,
          "h-full": hFull,
        })}
      >
        {/* visible input */}
        <input
          type="text"
          list="options"
          required={required}
          value={label}
          ref={inputRef}
          onChange={handleChangeEvent}
          onBlur={handleBlurEvent}
          disabled={disabled}
          className={classNames("border", "p-2", {
            "w-full": wFull,
            "h-full": hFull,
          })}
        />
        <datalist id="options">{autoCompleteOptions}</datalist>

        {/* hidden input */}
        <input
          type="text"
          value={value?.value ?? ""}
          name={name}
          readOnly
          className={classNames("hidden")}
        />
      </div>
    </InputContainer>
  );
};

export interface FormTextAreaProps extends FormTextInputProps {
  rows?: number;
}
export const FormTextArea = (props: FormTextAreaProps): ReactElement => {
  const [value, setValue] = useState<string | null>(null);
  return <TextArea {...props} value={value} setValue={setValue} />;
};

export interface TextAreaProps extends FormTextAreaProps {
  value: string | null;
  setValue: (value: string | null) => void;
}
export const TextArea = ({
  title,
  name,
  value,
  setValue,
  disabled = false,
  required = false,
  hFull = false,
  wFull = false,
  rows = 8,
}: // rows,
TextAreaProps): ReactElement => {
  const strValue = value ?? "";

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value === "") setValue(null);
    else setValue(e.target.value);
  };

  return (
    <InputContainer
      title={title}
      disabled={disabled}
      wFull={wFull}
      hFull={hFull}
    >
      <textarea
        rows={rows}
        name={name}
        className={classNames("border", "p-2", {
          "w-full": wFull,
          "h-full": hFull,
        })}
        value={strValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
    </InputContainer>
  );
};

export interface FormTextInputProps extends InputContainerProps {
  name?: string;
  required?: boolean;
}
export const FormTextInput = (props: FormTextInputProps): ReactElement => {
  const [value, setValue] = useState<string | null>(null);
  return <TextInput {...props} value={value} setValue={setValue} />;
};

export interface TextInputProps extends FormTextInputProps {
  value: string | null;
  setValue: (value: string | null) => void;
}
export const TextInput = ({
  title,
  name,
  value,
  setValue,
  disabled = false,
  required = false,
  hFull = false,
  wFull = false,
}: TextInputProps): ReactElement => {
  const strValue = value ?? "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") setValue(null);
    else setValue(e.target.value);
  };

  return (
    <InputContainer
      title={title}
      disabled={disabled}
      wFull={wFull}
      hFull={hFull}
    >
      <input
        type="text"
        name={name}
        className={classNames("border", "p-2", {
          "w-full": wFull,
          "h-full": hFull,
        })}
        value={strValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
    </InputContainer>
  );
};

export interface NumberInputProps extends InputContainerProps {
  min?: number;
  max?: number;
  value: number | null;
  setValue: (value: number | null) => void;
  noPad?: boolean;
  minNull?: boolean;
  inputClassName?: string;
  clearButton?: boolean;
  addMaxButton?: boolean;
}
export const NumberInput = ({
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  value,
  setValue,
  disabled,
  noPad,
  minNull,
  inputClassName,
  clearButton,
  addMaxButton,
  ...props
}: NumberInputProps): ReactElement => {
  const [localValue, setLocalValue] = useState<number | null>(value);
  const strValue = localValue?.toString() ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  const setGlobalValue = (newValue: number | null) => {
    setValue(newValue);
    setLocalValue(newValue);
  };

  const parseString = (str: string): number | null => {
    if (str === "") return null;
    const numValue = Number(str);
    if (numValue <= min) return minNull ? null : min;
    if (numValue > max) return max;
    return numValue;
  };

  const handleGlobal = (s: string | null): void =>
    setGlobalValue(s ? parseString(s) : null);
  const handleLocal = (s: string): void => {
    if (document.activeElement === inputRef.current) {
      setLocalValue(Number(s));
    } else {
      handleGlobal(s);
    }
  };
  const handlePaste = (pasted: string): void => {
    const pastedDigits = pasted.replace(/\D/g, "");
    handleGlobal(pastedDigits);
  };

  const handleBlurEvent = (e: ChangeEvent<HTMLInputElement>) =>
    handleGlobal(e.target.value);
  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>) =>
    handleLocal(e.target.value);
  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // prevent onChange from firing
    const pasted = e.clipboardData.getData("text/plain");
    handlePaste(pasted);
  };
  const handleDropEvent = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault(); // prevent onChange from firing
    const pasted = e.dataTransfer.getData("text/plain");
    handlePaste(pasted);
  };
  // by default, input will be cleared if user types a non-digit character
  // override that to do nothing
  const handleBeforeInputEvent = (e: FormEvent<HTMLInputElement>) => {
    const char: unknown = (e as any).data;
    const isDigit = typeof char === "string" && /\d/.test(char);
    if (!isDigit) e.preventDefault();
  };

  return (
    <InputContainer {...props} disabled={disabled}>
      <div className={classNames("flex", "w-max", "min-w-full")}>
        {clearButton && (
          <button
            className={classNames("mr-1", "bg-transparent")}
            onClick={() => setGlobalValue(null)}
          >
            <DelAll
              width={24}
              fill={"currentColor"}
              className={classNames(
                "text-primary-text",
                "hover:text-light-red-active"
              )}
            />
          </button>
        )}
        <input
          ref={inputRef}
          className={classNames(
            "border",
            { "p-2": !noPad },
            "flex-grow",
            inputClassName
          )}
          type="number"
          min={min}
          max={max}
          value={strValue}
          onChange={handleChangeEvent}
          onBlur={handleBlurEvent}
          onDrop={handleDropEvent}
          onBeforeInput={handleBeforeInputEvent}
          onPaste={handlePasteEvent}
          disabled={disabled}
        />
        {addMaxButton && (
          <button
            className={classNames("ml-1", "bg-transparent")}
            onClick={() => setGlobalValue(max)}
          >
            <AddAll
              width={24}
              fill={"currentColor"}
              className={classNames(
                "text-primary-text",
                "hover:text-light-blue-active"
              )}
            />
          </button>
        )}
      </div>
    </InputContainer>
  );
};

export interface ButtonProps {
  onClick?: () => void;
  className?: classNames.Argument;
  variant?: "default" | "success" | "failure" | "primary" | "lightblue";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children?: ReactNode;
  noPad?: boolean;
}
export const Button = ({
  onClick,
  variant,
  disabled,
  className,
  type,
  children,
  noPad,
}: ButtonProps): ReactElement => (
  <button
    type={type}
    className={classNames(
      {
        "p-2": !noPad,

        "hover:brightness-110": !disabled,
        "text-white": !disabled,

        "bg-light-blue-faded": variant === "lightblue",
        "bg-success-active": variant === "success",
        "bg-failure-active": variant === "failure",
        "bg-primary-active": variant === "primary",

        "opacity-50": disabled,
        "cursor-not-allowed": disabled,
        "brightness-75": disabled,
      },
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

export interface ManipulatorSelectorProps {
  options: string[];
  title: string;
  selected: string | null;
  setSelected: (selected: string | null) => void;
  disabled?: boolean;
}
export const ManipulatorSelector = ({
  options,
  title,
  selected,
  setSelected,
  disabled,
}: ManipulatorSelectorProps): ReactElement => (
  <select
    className={classNames("p-2", {
      "opacity-50": disabled,
      "cursor-not-allowed": disabled,
    })}
    value={selected ?? ""}
    onChange={(e) => {
      if (e.target.value === "_NONE_") setSelected(null);
      else setSelected(e.target.value);
    }}
    disabled={disabled}
  >
    <option disabled hidden value={""}>
      {title}
    </option>
    <option value={"_NONE_"}>None</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);
