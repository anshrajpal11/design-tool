import React from "react";
import type { EllipseLayer } from "~/types";
import { rgbToHex } from "~/utils";

const Ellipse = ({
  id,
  layer,
  onPointerDown
}: {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) => {
  const { x, y, width, height, fill, stroke, opacity } = layer;
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
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
      />

      <ellipse
      onPointerDown={(e)=>onPointerDown(e,id)}
        style={{ transform: `translate(${x}px,${y}px)` }}
        fill={fill ? rgbToHex(fill) : "#CCC"}
        stroke={stroke ? rgbToHex(stroke) : "#CCC"}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        strokeWidth={1}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
};

export default Ellipse;
