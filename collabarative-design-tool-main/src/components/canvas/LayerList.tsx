"use client";
import { useMutation, useStorage, useSelf } from "@liveblocks/react";
import React from "react";

const LayerList = ({ layerIds }: { layerIds?: string[] | null }) => {
  const deleteLayer = useMutation(({ storage }, id: string) => {
    const layers = storage.get("layers");
    const ids = storage.get("layerIds");
    layers.delete(id);
    const arr = [...ids];
    const idx = arr.indexOf(id);
    if (idx >= 0) {
      ids.delete(idx);
    }
  }, []);

  const self = useSelf((s) => s);
  const selectedId = self?.presence?.selection?.[0] as string | undefined;

  const setSelection = useMutation(({ setMyPresence }, id: string) => {
    setMyPresence({ selection: [id] }, { addToHistory: true });
  }, []);

  const bringForward = useMutation(({ storage }, id: string) => {
    const ids = storage.get("layerIds");
    const arr = [...ids];
    const idx = arr.indexOf(id);
    // Move backward in array to bring forward visually (SVG renders bottom-to-top)
    if (idx > 0) {
      const copy = arr.slice();
      const tmp = copy[idx - 1]!;
      copy[idx - 1] = copy[idx]!;
      copy[idx] = tmp;
      ids.clear();
      for (const v of copy) ids.push(v);
    }
  }, []);

  const sendBackward = useMutation(({ storage }, id: string) => {
    const ids = storage.get("layerIds");
    const arr = [...ids];
    const idx = arr.indexOf(id);
    // Move forward in array to send backward visually (SVG renders bottom-to-top)
    if (idx >= 0 && idx < arr.length - 1) {
      const copy = arr.slice();
      const tmp = copy[idx + 1]!;
      copy[idx + 1] = copy[idx]!;
      copy[idx] = tmp;
      ids.clear();
      for (const v of copy) ids.push(v);
    }
  }, []);

  const deleteAll = useMutation(({ storage }) => {
    const layers = storage.get("layers");
    const ids = storage.get("layerIds");
    for (const id of [...ids]) {
      layers.delete(id);
    }
    ids.clear();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <h3 className="text-sm font-semibold">Layers</h3>
        <button
          className="text-xs text-red-300 hover:underline"
          onClick={() => deleteAll()}
        >
          Delete all
        </button>
      </div>
      <div className="overflow-y-auto px-2 py-2">
        {layerIds && layerIds.length > 0 ? (
          layerIds.map((id, idx) => {
            const isSelected = selectedId === id;
            return (
              <div
                key={id}
                onClick={() => setSelection(id)}
                className={`flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer ${isSelected ? 'bg-blue-600/30' : 'hover:bg-white/5'}`}
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium">Layer {idx + 1}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button title="Bring forward" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); bringForward(id); setSelection(id); }}>↟</button>
                  <button title="Send backward" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); sendBackward(id); setSelection(id); }}>↡</button>
                  <button title="Delete" className="w-8 h-8 rounded bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); deleteLayer(id); }}>🗑</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-400 px-2 py-4">No layers</div>
        )}
      </div>
    </div>
  );
};

export default LayerList;
