"use client";
import React from "react";
import { useMutation, useSelf, useStorage } from "@liveblocks/react";
import { LayerType } from "~/types";
import { rgbToHex } from "~/utils";

const toRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const LayerInspector = () => {
  const self = useSelf((s) => s);
  const layersMap = useStorage((root) => root.layers);

  const [color, setColor] = React.useState<string>("#d9d9d9");

  const [width, setWidth] = React.useState<number>(100);
  const [height, setHeight] = React.useState<number>(100);
  const [fontSizeLocal, setFontSizeLocal] = React.useState<number>(16);
  const [fontWeightLocal, setFontWeightLocal] = React.useState<number>(400);
  const [fontFamilyLocal, setFontFamilyLocal] = React.useState<string>("Inter");
  const [borderRadiusLocal, setBorderRadiusLocal] = React.useState<number>(0);

  const setFill = useMutation(({ storage }, hex: string) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer) return;
    const rgb = toRgb(hex);
    layer.update({ fill: rgb });
  }, [self]);

  const setSize = useMutation(({ storage }, size: { w: number; h: number }) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer) return;
    layer.update({ width: size.w, height: size.h });
  }, [self]);

  const setFontSize = useMutation(({ storage }, fs: number) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer) return;
    layer.update({ fontSize: fs });
  }, [self]);

  const setFontWeight = useMutation(({ storage }, weight: number) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer) return;
    layer.update({ fontWeight: weight });
  }, [self]);

  const setFontFamily = useMutation(({ storage }, family: string) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer) return;
    layer.update({ fontFamily: family });
  }, [self]);

  const setBorderRadius = useMutation(({ storage }, radius: number) => {
    const selection = (self && self.presence && self.presence.selection) || [];
    if (selection.length === 0) return;
    const id = selection[0] as string;
    const layers = storage.get("layers");
    const layer = layers.get(id);
    if (!layer || !layer.get) return;
    const type = layer.get("type");
    if (type === LayerType.Text || type === LayerType.Path) return;
    layer.update({ cornerRadius: radius });
  }, [self]);

  React.useEffect(() => {
    if (!self || !self.presence || !self.presence.selection || self.presence.selection.length === 0) return;
    const id = self.presence.selection[0] as string;
    const layer = layersMap?.get(id);
    if (!layer) return;
    
    setColor(rgbToHex(layer.fill ?? { r: 217, g: 217, b: 217 }));
    setWidth(layer.width ?? 100);
    setHeight(layer.height ?? 100);
    
    if (layer.type === LayerType.Text) {
      setFontSizeLocal(layer.fontSize ?? 16);
      setFontWeightLocal(layer.fontWeight ?? 400);
      setFontFamilyLocal(layer.fontFamily ?? "Inter");
    }
    
    if (layer.type === LayerType.Rectangle || layer.type === LayerType.Ellipse) {
      setBorderRadiusLocal(layer.cornerRadius ?? 0);
    }
  }, [self?.presence?.selection?.length, layersMap]);

  if (!self || !self.presence || !self.presence.selection || self.presence.selection.length === 0) {
    return <div className="text-sm text-gray-400">Select a layer to edit</div>;
  }

  const selectedId = self.presence.selection[0] as string;
  const selectedLayer = layersMap?.get(selectedId);

  if (!selectedLayer) return null;

  return (
    <div className="flex flex-col gap-4 p-4 text-white h-full overflow-y-auto">
      <h4 className="text-lg font-medium">Inspector</h4>
      
      {/* Fill Color Control */}
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <label className="text-sm font-medium text-gray-300 block mb-2">Fill</label>
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setFill(e.target.value);
          }}
          className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
        />
      </div>

      {/* Size Controls */}
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <label className="text-sm font-medium text-gray-300 block mb-2">Size</label>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Width</label>
            <div className="flex items-center gap-2">
              <input 
                value={width} 
                onChange={(e) => setWidth(Number(e.target.value))} 
                type="number" 
                className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                onBlur={(e) => setSize({w: Number(e.target.value), h: height})} 
              />
              <span className="text-gray-400 text-sm">px</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Height</label>
            <div className="flex items-center gap-2">
              <input 
                value={height} 
                onChange={(e) => setHeight(Number(e.target.value))} 
                type="number" 
                className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                onBlur={(e) => setSize({w: width, h: Number(e.target.value)})} 
              />
              <span className="text-gray-400 text-sm">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Text Controls */}
      {selectedLayer.type === LayerType.Text && (
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-300 block mb-2">Font</label>
          <select 
            value={fontFamilyLocal} 
            onChange={(e) => {
              setFontFamilyLocal(e.target.value);
              setFontFamily(e.target.value);
            }}
            className="w-full px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-3"
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Monospace">Monospace</option>
          </select>

          <div className="flex gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Size</label>
              <div className="flex items-center gap-2">
                <input 
                  value={fontSizeLocal} 
                  onChange={(e) => setFontSizeLocal(Number(e.target.value))} 
                  type="number" 
                  className="w-20 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  onBlur={(e) => setFontSize(Number(e.target.value))} 
                />
                <div className="flex gap-1">
                  <button 
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600" 
                    onClick={() => { 
                      const v = fontSizeLocal + 1; 
                      setFontSizeLocal(v); 
                      setFontSize(v); 
                    }}
                  >
                    +
                  </button>
                  <button 
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600" 
                    onClick={() => { 
                      const v = Math.max(8, fontSizeLocal - 1); 
                      setFontSizeLocal(v); 
                      setFontSize(v); 
                    }}
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Weight</label>
              <select 
                value={fontWeightLocal} 
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFontWeightLocal(value);
                  setFontWeight(value);
                }}
                className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Border Radius - only for Rectangle and Ellipse */}
      {(selectedLayer.type === LayerType.Rectangle || selectedLayer.type === LayerType.Ellipse) && (
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-300 block mb-2">Border Radius</label>
          <div className="flex items-center gap-2">
            <input 
              value={borderRadiusLocal} 
              onChange={(e) => setBorderRadiusLocal(Number(e.target.value))} 
              type="number" 
              className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              onBlur={(e) => setBorderRadius(Number(e.target.value))} 
            />
            <div className="flex gap-1">
              <button 
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600" 
                onClick={() => { 
                  const v = borderRadiusLocal + 1; 
                  setBorderRadiusLocal(v); 
                  setBorderRadius(v); 
                }}
              >
                +
              </button>
              <button 
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600" 
                onClick={() => { 
                  const v = Math.max(0, borderRadiusLocal - 1); 
                  setBorderRadiusLocal(v); 
                  setBorderRadius(v); 
                }}
              >
                -
              </button>
            </div>
            <span className="text-gray-400 text-sm">px</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerInspector;
