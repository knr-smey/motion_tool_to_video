"use client";

import { useCallback, useRef, useState } from "react";
import {
  Sparkles,
  Palette,
  Type,
  Move,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CopyCheck,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Upload,
} from "lucide-react";
import type { Scene, SceneLayout } from "@/lib/segmentation";
import type { BackgroundConfig, BackgroundStyle } from "@/remotion/backgrounds/types";

export interface EditPanelProps {
  scenes: Scene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (index: number, updates: Partial<Scene>) => void;
  onApplyToAllScenes: (templateScene: Scene) => void;
  onResetScene: (index: number) => void;
}

const ANIMATION_OPTIONS: {
  id: SceneLayout;
  title: string;
  badge: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: "node-connector",
    title: "Node Flow",
    badge: "Tech / API",
    desc: "Animated point-to-point lines & data packet flow",
    icon: "🔗",
  },
  {
    id: "center-impact",
    title: "Center Impact",
    badge: "Punchy",
    desc: "Spring explosive scale & punch with overshoot",
    icon: "💥",
  },
  {
    id: "highlighter-sweep",
    title: "Highlighter Sweep",
    badge: "Contrast",
    desc: "Optical difference-mode bar sweep across text",
    icon: "⚡",
  },
  {
    id: "word-cascade",
    title: "Word Cascade",
    badge: "Dynamic",
    desc: "Staggered falling words dropping into frame",
    icon: "🌊",
  },
  {
    id: "cyber-scramble",
    title: "Cyber Scramble",
    badge: "Sci-Fi",
    desc: "Khmer glyph scramble-decrypt effect",
    icon: "👾",
  },
];

const BG_COLOR_SWATCHES = [
  { label: "Pitch Black", color: "#000000" },
  { label: "Deep Night", color: "#0B0F19" },
  { label: "Zinc Dark", color: "#18181B" },
  { label: "Pure White", color: "#FFFFFF" },
  { label: "Midnight Blue", color: "#0F172A" },
  { label: "Cyber Violet", color: "#1E1B4B" },
  { label: "Crimson Noir", color: "#2A0A10" },
  { label: "Forest Dark", color: "#062016" },
];

const TEXT_COLOR_SWATCHES = [
  { label: "Pure White", color: "#FFFFFF" },
  { label: "Pitch Black", color: "#000000" },
  { label: "Solar Yellow", color: "#FACC15" },
  { label: "Neon Cyan", color: "#06B6D4" },
  { label: "Lime Spark", color: "#22C55E" },
  { label: "Sunset Orange", color: "#F97316" },
  { label: "Hot Pink", color: "#EC4899" },
  { label: "Lilac Violet", color: "#A855F7" },
];

const BG_STYLE_OPTIONS: { id: BackgroundStyle; label: string }[] = [
  { id: "none", label: "Solid" },
  { id: "grid", label: "Grid" },
  { id: "galaxy", label: "Galaxy" },
  { id: "image", label: "Image" },
];

const ALIGN_9_GRID = [
  { label: "TL", title: "Top Left", x: -220, y: -160, icon: "↖" },
  { label: "TC", title: "Top Center", x: 0, y: -160, icon: "↑" },
  { label: "TR", title: "Top Right", x: 220, y: -160, icon: "↗" },
  { label: "ML", title: "Middle Left", x: -220, y: 0, icon: "←" },
  { label: "C", title: "Center", x: 0, y: 0, icon: "⊙" },
  { label: "MR", title: "Middle Right", x: 220, y: 0, icon: "→" },
  { label: "BL", title: "Bottom Left", x: -220, y: 160, icon: "↙" },
  { label: "BC", title: "Bottom Center", x: 0, y: 160, icon: "↓" },
  { label: "BR", title: "Bottom Right", x: 220, y: 160, icon: "↘" },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function EditPanel({
  scenes,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onApplyToAllScenes,
  onResetScene,
}: EditPanelProps) {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const dragPadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scene = scenes[activeSceneIndex];
  const hasScenes = scenes.length > 0 && !!scene;

  // Active scene values with graceful defaults
  const activeLayout = scene?.layout ?? "center-impact";
  const activeBgColor = scene?.backgroundColor ?? "#000000";
  const activeTextColor = scene?.textColor ?? "#FFFFFF";
  const activeLineHeight = scene?.lineHeight ?? 1.35;
  const activeFontSize = scene?.fontSize ?? 76;
  const activePosX = scene?.positionX ?? 0;
  const activePosY = scene?.positionY ?? 0;
  const activeAlign = scene?.textAlign ?? "center";
  const activeBackground = scene?.background ?? { style: "none", imageDataUrl: null };

  const handleApplyToAll = () => {
    if (!scene) return;
    onApplyToAllScenes(scene);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // 2D Drag Pad Handler
  const handleDragPadPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const pad = dragPadRef.current;
      if (!pad || !hasScenes) return;

      const rect = pad.getBoundingClientRect();
      const pointerMove = (moveEvent: PointerEvent) => {
        const clientX = moveEvent.clientX;
        const clientY = moveEvent.clientY;

        // Normalized relative position from -1 to 1
        const relX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
        const relY = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));

        // Scale to composition offset range
        const maxOffsetX = 350;
        const maxOffsetY = 240;

        const posX = Math.round(relX * maxOffsetX);
        const posY = Math.round(relY * maxOffsetY);

        onUpdateScene(activeSceneIndex, { positionX: posX, positionY: posY });
      };

      const pointerUp = () => {
        window.removeEventListener("pointermove", pointerMove);
        window.removeEventListener("pointerup", pointerUp);
      };

      window.addEventListener("pointermove", pointerMove);
      window.addEventListener("pointerup", pointerUp);

      // Trigger immediate first update
      pointerMove(e.nativeEvent);
    },
    [activeSceneIndex, hasScenes, onUpdateScene]
  );

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataUrl(file);
    const updatedBg: BackgroundConfig = { style: "image", imageDataUrl: dataUrl };
    onUpdateScene(activeSceneIndex, { background: updatedBg });
  };

  if (!hasScenes) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted">
        <Sparkles className="mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm font-medium">No Scene Selected</p>
        <p className="text-xs text-muted/80 mt-1">
          Type or select a script in the left panel to begin editing scenes.
        </p>
      </div>
    );
  }

  // Calculate 2D pad puck coordinates (percentage: 0% to 100%)
  const padPuckLeft = Math.max(5, Math.min(95, ((activePosX / 350 + 1) / 2) * 100));
  const padPuckTop = Math.max(5, Math.min(95, ((activePosY / 240 + 1) / 2) * 100));

  return (
    <div className="flex flex-col gap-5 p-4 text-foreground">
      {/* 1. Header & Scene Navigation */}
      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/20 font-bold text-accent text-xs">
              #{activeSceneIndex + 1}
            </span>
            <span className="text-sm font-semibold">Scene Inspector</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={activeSceneIndex <= 0}
              onClick={() => onSelectScene(activeSceneIndex - 1)}
              className="rounded p-1 text-muted hover:bg-surface-raised hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
              title="Previous scene"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted px-1 tabular-nums">
              {activeSceneIndex + 1} / {scenes.length}
            </span>
            <button
              type="button"
              disabled={activeSceneIndex >= scenes.length - 1}
              onClick={() => onSelectScene(activeSceneIndex + 1)}
              className="rounded p-1 text-muted hover:bg-surface-raised hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
              title="Next scene"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Scene Text input/edit */}
        <div className="mt-2.5 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span className="font-medium">Scene Text</span>
            <span>{scene.wordCount} words</span>
          </div>
          <textarea
            value={scene.text}
            onChange={(e) => onUpdateScene(activeSceneIndex, { text: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg border border-border/80 bg-surface-raised px-3 py-2 text-xs font-[family-name:var(--font-kantumruy-pro)] text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Edit text for this scene..."
          />
        </div>

        {/* Scene Duration in Seconds */}
        <div className="mt-2 flex items-center justify-between rounded-lg border border-border/60 bg-surface-raised px-2.5 py-1.5 text-xs">
          <span className="text-muted">Duration</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.6}
              max={6.0}
              step={0.1}
              value={scene.durationSeconds}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateScene(activeSceneIndex, {
                  durationSeconds: val,
                  durationInFrames: Math.round(val * 30),
                });
              }}
              className="w-20 accent-accent cursor-pointer"
            />
            <span className="font-mono font-bold text-accent tabular-nums w-10 text-right">
              {scene.durationSeconds.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Batch action buttons */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <button
            type="button"
            onClick={handleApplyToAll}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
            title="Apply this scene's style, font & colors to all scenes"
          >
            {copiedNotification ? (
              <>
                <Check size={13} className="text-green-400" />
                <span className="text-green-400">Applied to All!</span>
              </>
            ) : (
              <>
                <CopyCheck size={13} />
                <span>Apply to All Scenes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onResetScene(activeSceneIndex)}
            className="flex items-center justify-center gap-1 rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-border hover:text-foreground"
            title="Reset this scene to default styles"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Animation Layout Selector */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-sm font-semibold">Animation Style</h3>
          </div>
          <span className="text-[11px] font-medium text-muted">
            {ANIMATION_OPTIONS.find((a) => a.id === activeLayout)?.badge}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ANIMATION_OPTIONS.map((opt) => {
            const isSelected = activeLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { layout: opt.id })}
                className={`relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/15 text-foreground ring-1 ring-accent"
                    : "border-border bg-surface-raised text-muted hover:border-border hover:text-foreground"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-base">{opt.icon}</span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
                <div className="font-semibold text-xs leading-snug mt-1 text-foreground">
                  {opt.title}
                </div>
                <div className="text-[10px] leading-tight opacity-75 line-clamp-2">
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Background & Color Settings */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-accent" />
          <h3 className="text-sm font-semibold">Background & Colors</h3>
        </div>

        {/* Background Style Type Tabs */}
        <div>
          <label className="text-xs font-medium text-muted block mb-1.5">
            Background Effect
          </label>
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-surface-raised p-1">
            {BG_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const updatedBg: BackgroundConfig = {
                    style: opt.id,
                    imageDataUrl: activeBackground.imageDataUrl,
                  };
                  onUpdateScene(activeSceneIndex, { background: updatedBg });
                }}
                className={`rounded py-1 text-xs font-medium transition ${
                  activeBackground.style === opt.id
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Image Upload if Image style selected */}
        {activeBackground.style === "image" && (
          <div className="rounded-lg border border-dashed border-border p-3 text-center">
            {activeBackground.imageDataUrl ? (
              <div className="relative overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeBackground.imageDataUrl}
                  alt="Custom scene bg"
                  className="h-20 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateScene(activeSceneIndex, {
                      background: { style: "none", imageDataUrl: null },
                    })
                  }
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/80 p-1 text-white hover:bg-black"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-3 py-1.5 text-xs text-foreground hover:border-accent"
                >
                  <Upload size={13} />
                  <span>Choose Image</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Background Color Picker & Swatches */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted">Background Color</label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-muted uppercase">
                {activeBgColor}
              </span>
              <input
                type="color"
                value={activeBgColor}
                onChange={(e) =>
                  onUpdateScene(activeSceneIndex, { backgroundColor: e.target.value })
                }
                className="h-5 w-6 cursor-pointer rounded border border-border bg-transparent"
                title="Choose custom background color"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {BG_COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.color}
                type="button"
                onClick={() =>
                  onUpdateScene(activeSceneIndex, { backgroundColor: swatch.color })
                }
                title={swatch.label}
                style={{ backgroundColor: swatch.color }}
                className={`h-7 rounded-md border flex items-center justify-center transition-transform hover:scale-105 ${
                  activeBgColor.toLowerCase() === swatch.color.toLowerCase()
                    ? "border-accent ring-2 ring-accent"
                    : "border-border/80"
                }`}
              >
                {activeBgColor.toLowerCase() === swatch.color.toLowerCase() && (
                  <Check
                    size={12}
                    className={swatch.color === "#FFFFFF" ? "text-black" : "text-white"}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color Picker & Swatches */}
        <div className="border-t border-border/60 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted">Text Color</label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-muted uppercase">
                {activeTextColor}
              </span>
              <input
                type="color"
                value={activeTextColor}
                onChange={(e) =>
                  onUpdateScene(activeSceneIndex, { textColor: e.target.value })
                }
                className="h-5 w-6 cursor-pointer rounded border border-border bg-transparent"
                title="Choose custom text color"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TEXT_COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.color}
                type="button"
                onClick={() =>
                  onUpdateScene(activeSceneIndex, { textColor: swatch.color })
                }
                title={swatch.label}
                style={{ backgroundColor: swatch.color }}
                className={`h-7 rounded-md border flex items-center justify-center transition-transform hover:scale-105 ${
                  activeTextColor.toLowerCase() === swatch.color.toLowerCase()
                    ? "border-accent ring-2 ring-accent"
                    : "border-border/80"
                }`}
              >
                {activeTextColor.toLowerCase() === swatch.color.toLowerCase() && (
                  <Check
                    size={12}
                    className={swatch.color === "#FFFFFF" ? "text-black" : "text-white"}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Line Height & Typography */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-accent" />
            <h3 className="text-sm font-semibold">Line-Height & Typography</h3>
          </div>
          <span className="font-mono text-xs text-accent tabular-nums">
            {activeLineHeight.toFixed(2)}x
          </span>
        </div>

        {/* Line Height Slider & Presets */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Line Height</span>
            <div className="flex gap-1.5">
              {[
                { label: "Tight", val: 1.15 },
                { label: "Normal", val: 1.35 },
                { label: "Loose", val: 1.65 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { lineHeight: p.val })}
                  className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-muted hover:text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={1.0}
            max={2.4}
            step={0.05}
            value={activeLineHeight}
            onChange={(e) =>
              onUpdateScene(activeSceneIndex, { lineHeight: Number(e.target.value) })
            }
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        {/* Font Size Slider */}
        <div className="border-t border-border/60 pt-3">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Font Size</span>
            <span className="font-mono tabular-nums text-foreground">{activeFontSize}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={130}
            step={2}
            value={activeFontSize}
            onChange={(e) =>
              onUpdateScene(activeSceneIndex, { fontSize: Number(e.target.value) })
            }
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <button
              type="button"
              onClick={() => onUpdateScene(activeSceneIndex, { fontSize: 56 })}
              className="hover:text-foreground"
            >
              Small (56px)
            </button>
            <button
              type="button"
              onClick={() => onUpdateScene(activeSceneIndex, { fontSize: 76 })}
              className="hover:text-foreground"
            >
              Medium (76px)
            </button>
            <button
              type="button"
              onClick={() => onUpdateScene(activeSceneIndex, { fontSize: 96 })}
              className="hover:text-foreground"
            >
              Large (96px)
            </button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="border-t border-border/60 pt-3">
          <label className="text-xs font-medium text-muted block mb-1.5">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-raised p-1">
            {[
              { id: "left", label: "Left", icon: AlignLeft },
              { id: "center", label: "Center", icon: AlignCenter },
              { id: "right", label: "Right", icon: AlignRight },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onUpdateScene(activeSceneIndex, {
                    textAlign: id as "left" | "center" | "right",
                  })
                }
                className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition ${
                  activeAlign === id
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Drag Position (2D Drag Pad & Position Controls) */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move size={16} className="text-accent" />
            <h3 className="text-sm font-semibold">Drag Position</h3>
          </div>
          <span className="font-mono text-xs text-muted tabular-nums">
            X: {activePosX > 0 ? `+${activePosX}` : activePosX}px, Y:{" "}
            {activePosY > 0 ? `+${activePosY}` : activePosY}px
          </span>
        </div>

        <p className="text-xs text-muted">
          Drag inside the box below to position text interactively on canvas.
        </p>

        {/* 2D Interactive Trackpad / Drag Box */}
        <div
          ref={dragPadRef}
          onPointerDown={handleDragPadPointer}
          className="relative h-36 w-full cursor-crosshair rounded-lg border border-border bg-surface-raised overflow-hidden select-none touch-none shadow-inner"
        >
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a2f_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2f_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

          {/* Center Crosshair Guidelines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/80 border-r border-dashed border-muted/30" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/80 border-b border-dashed border-muted/30" />

          {/* Active Draggable Puck */}
          <div
            style={{
              left: `${padPuckLeft}%`,
              top: `${padPuckTop}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute flex items-center justify-center pointer-events-none"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40 ring-4 ring-accent/20">
              <Move size={13} className="text-accent-foreground" />
            </div>
          </div>

          <div className="absolute bottom-1 right-2 text-[10px] text-muted/60 pointer-events-none">
            2D Drag Pad
          </div>
        </div>

        {/* 9-Point Quick Alignment Matrix */}
        <div>
          <label className="text-xs font-medium text-muted block mb-1.5">
            Quick Alignment Snap
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {ALIGN_9_GRID.map((item) => {
              const isCurrent = activePosX === item.x && activePosY === item.y;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    onUpdateScene(activeSceneIndex, {
                      positionX: item.x,
                      positionY: item.y,
                    })
                  }
                  title={`${item.title} (${item.x}, ${item.y})`}
                  className={`flex items-center justify-center gap-1 rounded border py-1.5 text-xs transition ${
                    isCurrent
                      ? "border-accent bg-accent/15 text-accent font-semibold"
                      : "border-border bg-surface-raised text-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Numeric Sliders */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3 text-xs">
          <div>
            <div className="flex items-center justify-between text-muted mb-1">
              <span>X Offset</span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-foreground">{activePosX}px</span>
                {activePosX !== 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateScene(activeSceneIndex, { positionX: 0 })}
                    className="text-[10px] text-accent hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={-350}
              max={350}
              step={5}
              value={activePosX}
              onChange={(e) =>
                onUpdateScene(activeSceneIndex, { positionX: Number(e.target.value) })
              }
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-muted mb-1">
              <span>Y Offset</span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-foreground">{activePosY}px</span>
                {activePosY !== 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateScene(activeSceneIndex, { positionY: 0 })}
                    className="text-[10px] text-accent hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={-240}
              max={240}
              step={5}
              value={activePosY}
              onChange={(e) =>
                onUpdateScene(activeSceneIndex, { positionY: Number(e.target.value) })
              }
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => onUpdateScene(activeSceneIndex, { positionX: 0, positionY: 0 })}
            className="mt-1 flex items-center justify-center gap-1 rounded-md border border-border bg-surface-raised py-1 text-xs text-muted hover:text-foreground"
          >
            <RotateCcw size={12} />
            <span>Reset Position to Center (0, 0)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
