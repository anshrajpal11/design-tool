"use client";
import React from "react";
import { useOthers, useSelf } from "@liveblocks/react";

const CursorsOverlay = () => {
  const others = useOthers();
  const self = useSelf();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...others].map((other) => {
        const presence: any = other.presence;
        const cursor = presence?.cursor;
  const name = (other.info as any)?.name ?? (other.info as any)?.user?.name ?? "Guest";
        if (!cursor) return null;
        const style: React.CSSProperties = {
          position: "absolute",
          left: cursor.x,
          top: cursor.y,
          transform: "translate(-50%,-100%)",
        };
        return (
          <div key={other.connectionId} style={style} className="flex items-center gap-2 bg-black/60 text-white text-xs rounded px-2 py-1">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div>{name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CursorsOverlay;
