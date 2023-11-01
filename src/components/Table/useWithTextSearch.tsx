import { FilterDropdownProps } from "antd/es/table/interface";
import { ColumnType } from "antd/es/table";
import { useRef, FocusEvent } from "react";
import classNames from "classnames";
import { SearchIcon } from "../SVG";

// apply to a column to add a search bar
export const useWithTextSearch = <C,>(
  column: ColumnType<C>,
  recordIncludes: (record: C, lowerCaseText: string) => boolean // true if record includes search text
): ColumnType<C> => {
  // stores the props from filterDropdown for use in filterIcon
  const filterDropdownPropsRef = useRef<FilterDropdownProps | null>(null);

  const isMatch = (pattern: string, record: C): boolean => {
    if (pattern === "") {
      return true;
    } else if (pattern[0] === "!") {
      return !recordIncludes(record, pattern.slice(1));
    } else {
      return recordIncludes(record, pattern);
    }
  };

  const FilterDropdown = (props: FilterDropdownProps) => {
    // BLACK MAGIC STEP 1
    // set the ref to the props so we can use it in filterIcon
    filterDropdownPropsRef.current = props;
    return <></>;
  };

  // BLACK MAGIC STEP 2
  // create a function that uses the props and value refs to commit the search
  const commitSearch = (filterValue: string) => {
    // if the ref is null, we can't commit
    if (filterDropdownPropsRef.current === null) return;

    // set the filter value and confirm
    const filterValueLower = filterValue.toLowerCase();
    const { setSelectedKeys, confirm } = filterDropdownPropsRef.current;
    setSelectedKeys(filterValueLower === "" ? [] : [filterValueLower]);
    confirm();
  };

  interface FilterIconProps {
    filtered: boolean;
  }
  const FilterIcon = ({ filtered }: FilterIconProps) => {
    // blur commits immediately
    const handleBlur = (e: FocusEvent<HTMLInputElement>) =>
      commitSearch(e.target.value);

    // commit the search on blur
    return (
      <>
        <input
          type="text"
          placeholder="search"
          onBlur={handleBlur}
          className={classNames("w-28", "px-2", "py-1", "rounded", {
            [classNames("border-light-blue-base", "border", "-m-px")]: filtered,
          })}
        />
        <button
          className={classNames(
            "w-6",
            "bg-transparent",
            "hover:text-light-blue-base",
            "brightness-150"
          )}
        >
          <SearchIcon
            fill="none"
            stroke="currentColor"
            className="brightness-50"
            style={{
              transform: "scaleX(-1)",
            }}
          />
        </button>
      </>
    );
  };

  return {
    // unpack the column first so we can overwrite instead of getting overwritten
    ...column,
    // called when the search bar is clicked
    filterDropdown: (filterDropdownProps) => (
      <FilterDropdown {...filterDropdownProps} />
    ),
    // the search bar
    filterIcon: (filtered: boolean) => <FilterIcon filtered={filtered} />,
    // filter the values
    onFilter: (value, record) => isMatch(value as string, record),
  };
};
