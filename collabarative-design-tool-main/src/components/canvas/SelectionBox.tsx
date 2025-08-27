import { useSelf, useStorage } from "@liveblocks/react";
import { LayerType, Side, type XYWH } from "~/types";
import { useEffect, useRef, useState } from "react";

const handleWidth = 8;

export default function SelectionBox({onResizeHandlePointerDown}:{onResizeHandlePointerDown:(corner:Side,initialBuild:XYWH)=>void}) {
  const soleLayerId = useSelf((me) =>
    me.presence.selection.length === 1 ? me.presence.selection[0] : null,
  );

  const isShowingHandles = useStorage(
    (root) =>
      soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path,
  );

  const textRef = useRef<SVGTextElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const padding = 16;

  const layers = useStorage((root) => root.layers);
  const layer = soleLayerId ? layers?.get(soleLayerId) : null;

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextWidth(bbox.width);
    }
  }, [layer]);

  if (!layer) {
    return null;
  }

  return (
    <>
      <rect
        style={{ transform: `translate(${layer?.x}px,${layer?.y}px)` }}
        className="pointer-events-none fill-transparent stroke-[#0B99FF] stroke-[1px]"
        width={layer?.width}
        height={layer?.height}
      />

      <rect
        className="fill-[#000000]"
        x={layer.x + layer.width / 2 - (textWidth + padding) / 2}
        y={layer.y + layer.height + 10}
        width={textWidth + padding}
        height={20}
        rx={4}
      />

      <text
        ref={textRef}
        style={{
          transform: `translate(${layer.x + layer.width / 2}px,${layer?.y + layer.height + 25}px)`,
        }}
        className="pointer-events-none fill-white text-[11px]"
        textAnchor="middle"
      >
        {Math.round(layer.width)} x{Math.round(layer.height)}
      </text>

      {isShowingHandles && (
        <>
          {/* Top-left */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "nwse-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x - handleWidth / 2}px,${layer.y - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Top+Side.Left,layer)
  }}
/>

{/* Top-center */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "n-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x + layer.width / 2 - handleWidth / 2}px,${layer.y - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Top,layer)
  }}
/>

{/* Top-right */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "nesw-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x + layer.width - handleWidth / 2}px,${layer.y - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Top+Side.Right,layer)
  }}
/>

{/* Middle-left */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "w-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x - handleWidth / 2}px,${layer.y + layer.height / 2 - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Left,layer)
  }}
/>

{/* Bottom-left */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "nesw-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x - handleWidth / 2}px,${layer.y + layer.height - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Bottom+Side.Left,layer)
  }}
/>

{/* Middle-right */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "e-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x + layer.width - handleWidth / 2}px,${layer.y + layer.height / 2 - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Right,layer)
  }}
/>

{/* Bottom-right */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "nwse-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x + layer.width - handleWidth / 2}px,${layer.y + layer.height - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Bottom+Side.Right,layer)
  }}
/>

{/* Bottom-center */}
<rect
  className="fill-white stroke-[#0B99FF] stroke-[1px]"
  style={{
    cursor: "s-resize",
    width: `${handleWidth}px`,
    height: `${handleWidth}px`,
    transform: `translate(${layer.x + layer.width / 2 - handleWidth / 2}px,${layer.y + layer.height - handleWidth / 2}px)`,
  }}
  onPointerDown={(e)=>{
    e.stopPropagation();
    onResizeHandlePointerDown(Side.Bottom,layer)
  }}
/>

        </>
      )}
    </>
  );
}
