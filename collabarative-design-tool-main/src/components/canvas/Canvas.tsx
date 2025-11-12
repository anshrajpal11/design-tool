"use client";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useMyPresence,
  useRoom,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import LayerList from "./LayerList";
import LayerInspector from "./LayerInspector";
import CursorsOverlay from "./CursorsOverlay";
import Path from "./Path";
import Navbar from "./Navbar";
import SelectionBox from "./SelectionBox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Check,
  Clock,
  Copy,
  Download,
  History,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

const MAX_LAYERS = 100;

const SERIALIZED_LAYER_PROPS = [
  "x",
  "y",
  "width",
  "height",
  "text",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "fill",
  "stroke",
  "opacity",
  "points",
];

const buildCanvasSnapshot = (storage: any) => {
  const liveLayers = storage.get("layers");
  const liveLayerIds = storage.get("layerIds");

  const state: Record<string, any> = {
    layerIds: Array.from((liveLayerIds as any[]) ?? []),
    layers: {},
  };

  for (const id of state.layerIds) {
    const layer = liveLayers.get(id);
    if (!layer) continue;
    const obj: Record<string, any> = { type: layer.get("type") };
    for (const prop of SERIALIZED_LAYER_PROPS) {
      try {
        const value = layer.get(prop as any);
        if (value !== undefined) obj[prop] = value;
      } catch {
        // ignore property read errors
      }
    }
    state.layers[id] = obj;
  }

  return state;
};

const Canvas = () => {
  const room = useRoom();
  const roomId = room?.id ?? null;
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [myPresence, setMyPresence] = useMyPresence();

  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // debug: myPresence is a tuple [presence, setMyPresence], but here we only need presence
  console.log(myPresence.selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();

      e.stopPropagation();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }
      const point = pointerEventToCanvasPoint(e, camera);
      setState({ mode: CanvasMode.Translating, current: point });
    },
    [camera, canvasState.mode, history],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
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

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");
      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          // if text layer, also update font size proportionally to height
          if (layer.get && layer.get("type") === LayerType.Text) {
            // Scale font size more naturally with height, using a sqrt function
            // This makes small adjustments have less impact but still allows large changes
            const newFontSize = Math.max(
              8,
              Math.round(Math.sqrt(bounds.height) * 4),
            );
            layer.update({ ...bounds, fontSize: newFontSize });
          } else {
            layer.update(bounds);
          }
        }
      }
    },
    [canvasState],
  );

  const unSelectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

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
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      }
    },
    [canvasState, setState, insertLayer, continueDrawing, resizeSelectedLayer],
  );

  // ref to SVG so we can calculate container-relative coords for presence cursor
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [commitsOpen, setCommitsOpen] = useState(false);
  const [commitName, setCommitName] = useState("");
  const [commitsList, setCommitsList] = useState<
    Array<{ id: string; name: string; createdAt: string }>
  >([]);
  const [isCommitsLoading, setIsCommitsLoading] = useState(false);
  const [isSavingCommit, setIsSavingCommit] = useState(false);
  const [downloadingCommitId, setDownloadingCommitId] = useState<string | null>(
    null,
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const fetchCommits = useCallback(async () => {
    try {
      if (!roomId) return;
      setIsCommitsLoading(true);
      const res = await fetch(
        `/api/commits?roomId=${encodeURIComponent(roomId)}`,
      );
      const json = await res.json();
      setCommitsList(json.commits || []);
    } catch (err) {
      console.error("Failed to fetch commits", err);
    } finally {
      setIsCommitsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (commitsOpen) {
      void fetchCommits();
    }
  }, [commitsOpen, fetchCommits]);

  // Helper: serialize storage layers into plain JSON inside a mutation
  const serializeCanvasStateMutation = useMutation(({ storage }) => {
    return buildCanvasSnapshot(storage);
  }, []);

  const saveCommitMutation = useMutation(
    async ({ storage }, name: string, pngDataUrl?: string) => {
      try {
        if (!roomId) throw new Error("Missing room id");
        const state = buildCanvasSnapshot(storage);

        // send to server
        await fetch("/api/commits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            name,
            state: JSON.stringify(state),
            pngBase64: pngDataUrl,
          }),
        });
        // refresh commits list
        await fetchCommits();
      } catch (err) {
        console.error(err);
      }
    },
    [roomId, fetchCommits],
  );

  // capture PNG from SVG element
  const captureSvgAsPng = async (): Promise<string | undefined> => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const rect = svg.getBoundingClientRect();
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    // add xmlns if missing
    if (!svgString.includes("xmlns=")) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.width = rect.width;
      img.height = rect.height;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            ctx.fillStyle =
              window.getComputedStyle(svg).backgroundColor || "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });
      const dataUrl = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      return dataUrl;
    } catch (err) {
      console.error("captureSvgAsPng error", err);
      return undefined;
    }
  };

  const onSaveCommit = async () => {
    if (!commitName) {
      alert("Please enter a commit name");
      return;
    }
    if (!roomId) {
      alert("Room not ready yet. Please try again in a moment.");
      return;
    }
    try {
      setIsSavingCommit(true);
      const png = await captureSvgAsPng();
      // call mutation which reads live storage and posts to server
      await saveCommitMutation(commitName, png);
      setCommitName("");
    } catch (err) {
      console.error("Failed to save commit", err);
      alert("Failed to save commit. Please try again.");
    } finally {
      setIsSavingCommit(false);
    }
  };

  const handleDownloadCommit = async (commitId: string, name: string) => {
    try {
      setDownloadingCommitId(commitId);
      const res = await fetch(`/api/commits/${commitId}/download`);
      if (!res.ok) {
        throw new Error(`Download failed: ${res.statusText}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${name.replace(/[^\w.-]+/g, "_") || "canvas"}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error", err);
      alert("Unable to download commit PNG right now.");
    } finally {
      setDownloadingCommitId(null);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setSummaryOpen(true);
      setSummaryGenerating(true);
      setSummaryError(null);
      setSummaryText(null);
      setSummaryCopied(false);

      const snapshot = await serializeCanvasStateMutation();
      const res = await fetch("/api/canvas-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: snapshot }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to generate summary");
      }

      setSummaryText(json.summary ?? "");
    } catch (err) {
      console.error("Canvas summary error", err);
      setSummaryError(
        err instanceof Error
          ? err.message
          : "Unable to generate summary right now.",
      );
    } finally {
      setSummaryGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
    } catch (err) {
      console.error("Copy summary failed", err);
      setSummaryError("Unable to copy summary to clipboard.");
    }
  };

  const formatCommitTimestamp = (timestamp: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp));
    } catch {
      return timestamp;
    }
  };

  // wrapper pointer move handler: updates my presence cursor in screen/container coords,
  // then delegates to the mutation handler which handles drawing/transforming
  const handlePointerMove = (e: React.PointerEvent) => {
    try {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // round to integers to reduce presence churn
        setMyPresence({ cursor: { x: Math.round(x), y: Math.round(y) } });
      }
    } catch (err) {
      // ignore
    }

    // call existing mutation that handles canvas interactions
    onPointerMove(e);
  };

  const handlePointerLeave = () => {
    try {
      setMyPresence({ cursor: null });
    } catch (err) {
      // ignore
    }
  };

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
      } else {
        setState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [canvasState, setState, insertLayer, unSelectLayers, history],
  );

  return (
    <div className="flex h-screen w-full flex-col">
      <Navbar roomName="Design Collaboration" />

      <div className="flex flex-1">
        {/* Left sidebar - layers */}
        <aside className="flex w-64 flex-col overflow-y-auto border-r bg-gray-900 p-4">
          <LayerList layerIds={layerIds as unknown as string[]} />
        </aside>

        <main className="relative flex-1 overflow-hidden">
          <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
            <Button
              variant="secondary"
              onClick={handleGenerateSummary}
              className="flex items-center gap-2 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <Sparkles className="h-4 w-4 text-indigo-200" />
              Summarize canvas
            </Button>

            <Dialog
              open={commitsOpen}
              onOpenChange={(open) => {
                setCommitsOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <History className="h-4 w-4" />
                  Commits
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-gray-800 bg-[#111217] text-gray-100 shadow-2xl sm:max-w-[620px]">
                <DialogHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-teal-400/10 p-4">
                    <div>
                      <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-white md:text-xl">
                        <History className="h-5 w-5 text-indigo-300" />
                        Canvas Commit History
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm text-slate-300">
                        Save snapshots of the current canvas and revisit earlier
                        versions. Each commit stores the full canvas state and a
                        downloadable PNG preview.
                      </DialogDescription>
                    </div>
                    <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200/80 md:inline-flex">
                      {commitsList.length}{" "}
                      {commitsList.length === 1 ? "commit" : "commits"}
                    </span>
                  </div>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-inner">
                    <p className="text-xs font-semibold tracking-wide text-indigo-200/80 uppercase">
                      Create new commit
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Give your snapshot a meaningful name so teammates
                      understand the context.
                    </p>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                      <Input
                        value={commitName}
                        onChange={(event) => setCommitName(event.target.value)}
                        placeholder="e.g. Added hero section layout"
                        disabled={isSavingCommit}
                        className="border-white/10 bg-[#0c0d11] text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                      />
                      <Button
                        onClick={onSaveCommit}
                        disabled={
                          !commitName.trim() || isSavingCommit || !roomId
                        }
                        className="flex items-center justify-center gap-2 bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50"
                      >
                        {isSavingCommit ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Commit
                          </>
                        )}
                      </Button>
                    </div>
                    {!roomId && (
                      <p className="mt-2 text-sm text-amber-300/80">
                        The room is still loading. Hold tight and try again in a
                        moment.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0c0d11]">
                    <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      <span>Commit timeline</span>
                      <span className="flex items-center gap-2 text-indigo-200/70">
                        <Clock className="h-3.5 w-3.5" />
                        Sorted newest first
                      </span>
                    </div>
                    <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-4">
                      {isCommitsLoading ? (
                        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
                          Loading commits…
                        </div>
                      ) : commitsList.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/10 bg-transparent px-4 py-10 text-center text-sm text-slate-400">
                          <p className="font-medium text-slate-300">
                            No commits yet
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Capture your first snapshot to start building a
                            timeline of changes.
                          </p>
                        </div>
                      ) : (
                        commitsList.map((commit) => (
                          <div
                            key={commit.id}
                            className="group flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/5 px-4 py-3 transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {commit.name}
                              </p>
                              <p className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="h-3 w-3 text-indigo-300" />
                                {formatCommitTimestamp(commit.createdAt)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void handleDownloadCommit(
                                  commit.id,
                                  commit.name,
                                )
                              }
                              disabled={downloadingCommitId === commit.id}
                              className="flex items-center gap-2 border-white/20 text-white hover:border-indigo-400/80 hover:bg-indigo-500/10"
                            >
                              {downloadingCommitId === commit.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Preparing…
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Download PNG
                                </>
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setCommitsOpen(false)}
                    className="border border-white/10 bg-transparent text-slate-300 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={summaryOpen}
              onOpenChange={(open) => {
                setSummaryOpen(open);
                if (!open) {
                  setSummaryGenerating(false);
                  setSummaryError(null);
                }
              }}
            >
              <DialogContent className="border border-indigo-900/60 bg-[#0c0f1a] text-slate-100 shadow-2xl sm:max-w-[560px]">
                <DialogHeader className="space-y-3">
                  <div className="flex items-start gap-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                    <Sparkles className="h-6 w-6 text-indigo-200" />
                    <div>
                      <DialogTitle className="text-lg font-semibold text-white md:text-xl">
                        AI Canvas Summary
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm text-indigo-100/80">
                        We analyze the current canvas layers and generate a
                        short summary you can share with collaborators.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  {summaryGenerating ? (
                    <div className="flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing the canvas…
                    </div>
                  ) : summaryError ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {summaryError}
                    </div>
                  ) : summaryText ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-4 text-sm leading-relaxed text-indigo-100">
                        {summaryText.split("\n").map((line, idx) => (
                          <p key={idx} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleCopySummary}
                          className="flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
                        >
                          {summaryCopied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy summary
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-indigo-200/70">
                          Use this summary in project notes or updates.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Click “Summarize canvas” to generate an overview of the
                      current board.
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setSummaryOpen(false)}
                    className="border border-white/10 bg-transparent text-slate-300 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div
            style={{
              backgroundColor: roomColor ? rgbToHex(roomColor) : "#1e1e1e",
            }}
            className="relative h-full w-full touch-none"
          >
            <svg
              ref={svgRef}
              onWheel={onWheel}
              onPointerUp={onPointerUp}
              className="h-full w-full"
              onPointerDown={onPointerDown}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onPointerCancel={handlePointerLeave}
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

            {/* Cursors overlay (HTML) must be outside the SVG so we can position HTML elements on top */}
            <CursorsOverlay />
          </div>
        </main>

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
          redo={() => history.redo()}
          undo={() => history.undo()}
          canRedo={canRedo}
          canUndo={canUndo}
        />
        {/* Right sidebar - inspector */}
        <aside className="flex w-72 flex-col overflow-y-auto border-l bg-gray-900 p-4">
          <LayerInspector />
        </aside>
      </div>
    </div>
  );
};

export default Canvas;
