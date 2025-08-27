import React from "react";
import type { RectangleLayer } from "~/types";
import { rgbToHex } from "~/utils";

const Rectangle = ({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) => {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius } = layer;
  return (
    <g className="group">
      <rect
        width={width}
        height={height}
        fill="none"
        stroke="#0B99FF"
        strokeWidth={4}
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        style={{ transform: `translate(${x}px,${y}px)` }}
      />

      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px,${y}px)` }}
        width={width}
        height={height}
        fill={fill ? rgbToHex(fill) : "#CCC"}
        strokeWidth={1}
        stroke={stroke ? rgbToHex(stroke) : "#CCC"}
        opacity={`${opacity ?? 100}%`}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
    </g>
  );
};

export default Rectangle;
