import { ReactElement } from "react";
import { Dims } from "./dims";

const DEFAULT_SIZE_TRANSFORM = (dims: Dims): number => {
  const size = Math.min(dims.width, dims.height);
  return size / 4;
};

export interface LoadingProps {
  parentDims: Dims;
  sizeTransform?: (contentDims: Dims) => number;
}

export const Loading = ({
  parentDims,
  sizeTransform = DEFAULT_SIZE_TRANSFORM,
}: LoadingProps): ReactElement => {
  const size = sizeTransform(parentDims);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="ease-linear rounded-full border-8 border-gray-200 border-t-blue-500 animate-spin"
        style={{
          height: size,
          width: size,
        }}
      />
    </div>
  );
};
