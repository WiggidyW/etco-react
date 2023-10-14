"use client";

import { Button, SelectInput, SelectOption } from "../Input/Manipulator";
import { ReactElement, useState } from "react";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import Link from "next/link";

export interface LocationSelectProps {
  className?: string;
  defaultOption?: { label: string; value: string };
  options: { label: string; value: string }[];
}
export const LocationSelect = ({
  className,
  defaultOption,
  options,
}: LocationSelectProps): ReactElement => {
  const [location, setLocation] = useState<SelectOption<string> | null>(
    defaultOption ?? null
  );
  const pathName = usePathname();
  return (
    <div className={classNames("flex", "justify-center", className)}>
      <span className={classNames("flex-shrink")}>
        <SelectInput
          value={location}
          setValue={setLocation}
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
      <Link
        href={location ? `/shop/inventory/${location.value}` : pathName}
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
      </Link>
    </div>
  );
};
