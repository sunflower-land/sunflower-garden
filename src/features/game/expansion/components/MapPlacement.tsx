import React from "react";
import { GRID_WIDTH_PX } from "../../lib/constants";

export type Coordinates = {
  x: number;
  y: number;
};

export type Position = {
  height?: number;
  width?: number;
  z?: number;
} & Coordinates;

type Props = Position;

// const OFFSET_X = -22;
// export const OFFSET_Y = 22;
const OFFSET_X = 0;
export const OFFSET_Y = 0;

/**
 * This component is used to place items on the map. It uses the cartesian place coordinates
 * as the basis for its positioning. If the coordinates are 1,1 then the item will be placed one
 * grid size up and one grid right. The item will be placed at 0,0 of this coordinate.
 */
export const MapPlacement: React.FC<Props> = ({
  x,
  y,
  height,
  width,
  children,
  z = "unset",
}) => {
  return (
    <div
      className={"absolute"}
      style={{
        top: `calc(50% - ${GRID_WIDTH_PX * y + OFFSET_Y}px)`,
        left: `calc(50% + ${GRID_WIDTH_PX * x + OFFSET_X}px)`,
        height: height ? `${GRID_WIDTH_PX * height}px` : "auto",
        width: width ? `${GRID_WIDTH_PX * width}px` : "auto",
        zIndex: z,
      }}
    >
      {children}
    </div>
  );
};
