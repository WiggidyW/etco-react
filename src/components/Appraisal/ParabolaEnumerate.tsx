import classNames from "classnames";
import { ReactElement } from "react";

export interface ParabolaEnumerateProps {
  strs: string[];
  hClassName?: string;
}
export const ParabolaEnumerate = ({
  strs,
  hClassName = "text-xs",
}: ParabolaEnumerateProps): ReactElement => (
  <div className={classNames("inline-flex", "text-center")}>
    <Parabola rows={strs.length} vertex="left" />
    <span>
      {strs.map((str, i) => {
        return (
          <h2 className={hClassName} key={i}>
            {str}
          </h2>
        );
      })}
    </span>
    <Parabola rows={strs.length} vertex="right" />
  </div>
);

interface ParabolaProps {
  vertex: "left" | "right";
  rows: number;
}
const Parabola = ({ rows, vertex }: ParabolaProps): ReactElement => {
  const x = 10 + (12 * rows) / 2;
  const y = 50 * rows;
  const d =
    vertex === "right"
      ? `M0 0 Q${x} ${y / 2} 0 ${y}` // right
      : `M${x} 0 Q0 ${y / 2} ${x} ${y}`; // left
  return (
    <div
      className={classNames(
        "relative",
        "mt-1",
        "mb-1",
        "flex",
        "justify-center"
      )}
      style={{
        width: rows * 2.5 + 8,
      }}
    >
      <svg
        className={classNames("absolute", "h-full", "max-w-full")}
        viewBox={`0 0 ${x} ${y}`}
      >
        <path
          d={d}
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          vectorEffect={"non-scaling-stroke"}
        />
      </svg>
    </div>
  );
};
