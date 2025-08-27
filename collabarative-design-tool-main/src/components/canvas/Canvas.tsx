"use client";

import {
  useMutation,
  useMyPresence,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import type React from "react";
import { useCallback, useState } from "react";
import {
  penPointToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
  rgbToHex,
} from "~/utils";
import { LayerComponent } from "./LayerComponent";
import {
  type Camera,
  LayerType,
  type Layer,
  type Point,
  type RectangleLayer,
  type EllipseLayer,
  type CanvasState,
  CanvasMode,
  type TextLayer,
  Side,
  type XYWH,
} from "~/types";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import Toolsbar from "../toolsbar/Toolsbar";
import Path from "./Path";
import Navbar from "./Navbar";
import SelectionBox from "./SelectionBox";

const MAX_LAYERS = 100;

const Canvas = () => {
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const presence = useMyPresence();

  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });

  console.log(presence[0].selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      e.stopPropagation();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }
       const point = pointerEventToCanvasPoint(e,camera);
       setState({mode:CanvasMode.Translating,current:point});

    },
    [camera, canvasState.mode],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [],
  );

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      let layer: LiveObject<Layer> | null = null;

      console.log("Received layerType:", layerType);
      console.log("LayerType.Rectangle:", LayerType.Rectangle);
      console.log("LayerType.Ellipse:", LayerType.Ellipse);

      if (layerType === LayerType.Rectangle) {
        console.log("It's a rectangle.");
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Ellipse) {
        console.log("It's a ellipse.");
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          text: "Text",
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
          fontSize: 16,
          fontWeight: 400,
          fontFamily: "Inter",
        });
      }

      console.log("Created layer:", layer);
      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
    },
    [],
  );

  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;
    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }
    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(
        penPointToPathLayer(pencilDraft, { r: 217, g: 217, b: 217 }),
      ),
    );
    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);
    setMyPresence({ pencilDraft: null });
    setState({ mode: CanvasMode.Pencil });
  }, []);


  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );


  const resizeSelectedLayer = useMutation(({ storage, self }, point: Point) => {
    if (canvasState.mode !== CanvasMode.Resizing) {
      return;
    }

    const bounds = resizeBounds(
      canvasState.initialBounds,
      canvasState.corner,
      point,
    );
    
    const liveLayers = storage.get("layers");
    if(self.presence.selection.length>0){
      const layer = liveLayers.get(self.presence.selection[0]!);
      if(layer){
        layer.update(bounds);
      }
    }

  }, [canvasState]);

  const unSelectLayers = useMutation(({self,setMyPresence})=>{
    if(self.presence.selection.length>0){
      setMyPresence({selection:[]})
    }

  },[])

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: { r: 217, g: 217, b: 217 },
      });
    },
    [],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }
      setMyPresence({
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
        penColor: { r: 217, g: 217, b: 217 },
      });
    },
    [canvasState.mode],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
      zoom: camera.zoom,
    }));
  }, []);

  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }
    },
    [canvasState, setState, insertLayer, startDrawing],
  );

  const onPointerMove = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Dragging && canvasState.origin) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;
        setCamera((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
          zoom: prev.zoom,
        }));
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
       else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      }
    },
    [canvasState, setState, insertLayer, continueDrawing, resizeSelectedLayer],
  );

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.None) {
        setState({ mode: CanvasMode.None });
        unSelectLayers();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      }
      else{
        setState({mode:CanvasMode.None})
      }

    },
    [canvasState, setState, insertLayer,unSelectLayers],
  );

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Navbar */}
      <Navbar roomName="Design Collaboration" />

      {/* Canvas Area */}
      <div className="flex flex-1">
        <main className="relative flex-1 overflow-hidden">
          <div
            style={{
              backgroundColor: roomColor ? rgbToHex(roomColor) : "#1e1e1e",
            }}
            className="h-full w-full touch-none"
          >
            <svg
              onWheel={onWheel}
              onPointerUp={onPointerUp}
              className="h-full w-full"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
            >
              <g
                style={{
                  transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.zoom})`,
                }}
              >
                {layerIds?.map((layerId) => {
                  return (
                    <LayerComponent
                      key={layerId}
                      id={layerId}
                      onLayerPointerDown={onLayerPointerDown}
                    />
                  );
                })}

                <SelectionBox
                  onResizeHandlePointerDown={onResizeHandlePointerDown}
                />
              </g>

              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  fill={rgbToHex({ r: 217, g: 217, b: 217 })}
                  points={pencilDraft}
                  opacity={100}
                />
              )}
            </svg>
          </div>
        </main>

        {/* Toolbar */}
        <Toolsbar
          canvasState={canvasState}
          setCanvasState={(newState) => setState(newState)}
          zoomIn={() => {
            setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
          }}
          zoomOut={() => {
            setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
          }}
          canZoomIn={camera.zoom < 2}
          canZoomOut={camera.zoom > 0.5}
        />
      </div>
    </div>
  );
};

export default Canvas;
