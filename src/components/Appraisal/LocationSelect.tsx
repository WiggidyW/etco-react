"use client";

import { Button, FormSelectInput, SelectOption } from "../Input/Manipulator";
import { ReactElement, useState } from "react";
// import { useRouter } from "next/navigation";
import classNames from "classnames";

export interface LocationSelectProps {
  className?: string;
  defaultOption?: { label: string; value: string };
  basePath: string;
  options: { label: string; value: string }[];
}
export const LocationSelect = ({
  className,
  defaultOption,
  basePath,
  options,
}: LocationSelectProps): ReactElement => {
  // const router = useRouter();
  const setLocation = useState<SelectOption<string> | null>(
    defaultOption ?? null
  )[1];
  return (
    <form
      className={className}
      action={(formData) => {
        const locationId = Number(formData.get("locationId") as string);
        // router.push(`${basePath}?locationId=${locationId}`);
        window.history.pushState(
          {},
          "",
          `${basePath}?locationId=${locationId}`
        );
        window.location.reload();
      }}
    >
      <div className={classNames("flex", "w-full", "justify-center")}>
        <span className={classNames("flex-shrink")}>
          <FormSelectInput
            title="Location"
            name="locationId"
            options={options}
            required
            wFull
          />
        </span>
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
            className={classNames("h-10", "p-0", "px-2")}
            onClick={() => setLocation(null)}
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
          <Button type="submit" className={classNames("h-10", "p-0", "px-2")}>
            Shop
          </Button>
        </span>
      </div>
    </form>
  );
};
