"use client";
import React from "react";
import { useOthers, useSelf } from "@liveblocks/react";

const CursorsOverlay = () => {
  const others = useOthers();
  const self = useSelf();

  // derive a color from a string (connection id or user id)
  const colorFromString = (s?: string) => {
    if (!s) return "hsl(200 80% 50%)";
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) % 360;
    }
    return `hsl(${h} 75% 55%)`;
  };

  // get display name from liveblocks info
  const getDisplayName = (info: any) => {
    return info?.user?.name ?? info?.name ?? info?.user?.email ?? "Anonymous";
  };

  // helper to render a cursor badge
  const renderCursor = (
    key: string,
    cursor: { x: number; y: number } | null | undefined,
    name: string,
    color: string,
    isSelf = false,
  ) => {
    if (!cursor) return null;
    const style: React.CSSProperties = {
      position: "absolute",
      left: cursor.x,
      top: cursor.y,
      transform: "translate(-50%,-100%)",
      pointerEvents: "none",
      zIndex: 50,
    };

    const initials = name
      .split(" ")
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        key={key}
        style={style}
        className={`flex items-center gap-2 rounded px-2 py-1 text-xs text-white drop-shadow-lg transition-opacity duration-150`}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium"
          style={{ background: color, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
        >
          {initials}
        </div>
        <div className="rounded bg-black/60 px-2 py-1 text-sm whitespace-nowrap select-none">
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Render local cursor too (useful for testing) */}
      {renderCursor(
        "self",
        (self && (self.presence as any)?.cursor) as any,
        getDisplayName(self?.info),
        colorFromString(
          (self?.info as any)?.user?.id ?? String(self?.connectionId),
        ),
        true,
      )}

      {[...others].map((other) => {
        const presence: any = other.presence;
        const cursor = presence?.cursor;
        const name = getDisplayName(other.info);
        const color = colorFromString(
          (other.info as any)?.user?.id ?? String(other.connectionId),
        );
        return renderCursor(
          String(other.connectionId),
          cursor as any,
          name,
          color,
          false,
        );
      })}
    </div>
  );
};

export default CursorsOverlay;
