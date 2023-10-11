import classNames from "classnames";
import { ReactElement } from "react";

export interface TypeImageProps {
  typeId: number;
  width?: number;
}
export const TypeImage = ({
  typeId,
  width = 24,
}: TypeImageProps): ReactElement => (
  <img
    className={classNames(
      "type-image",
      "object-cover",
      "mr-1",
      "h-full",
      "aspect-[1/1]"
    )}
    src={`https://images.evetech.net/types/${typeId}/icon?size=32`}
    alt={typeId.toString()}
    width={width}
  />
);
