"use client";

import { useCallback, useRef, useState, useEffect, type RefObject, useMemo } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { KineticCast } from "@/remotion/Composition";
import type { Scene } from "@/lib/segmentation";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";
import { Move, Trash2, X } from "lucide-react";

export type AspectRatio = "16:9" | "9:16";

const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

function getFontFamilyCss(family?: string): string {
  switch (family) {
    case "Poppins":
      return "var(--font-poppins), sans-serif";
    case "Battambang":
      return "var(--font-battambang), sans-serif";
    case "Kantumruy Pro":
      return "var(--font-kantumruy-pro), sans-serif";
    case "Moul":
    default:
      return "var(--font-moul), var(--font-poppins), sans-serif";
  }
}

interface KineticStageProps {
  scenes: Scene[];
  totalDurationInFrames: number;
  aspectRatio: AspectRatio;
  background: BackgroundConfig;
  backgroundColor?: string;
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onUpdatePosition?: (x: number, y: number, isFinal?: boolean) => void;
  onUpdateText?: (index: number, newText: string) => void;
}

export function KineticStage({
  scenes,
  totalDurationInFrames,
  aspectRatio,
  background,
  backgroundColor = "#000000",
  playerRef,
  activeSceneIndex = 0,
  onUpdatePosition,
  onUpdateText,
}: KineticStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.4);
  const [isSelected, setIsSelected] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [snapGuides, setSnapGuides] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  const { width: compWidth, height: compHeight } = DIMENSIONS[aspectRatio];

  const activeScene = scenes[activeSceneIndex];
  const posX = activeScene?.positionX ?? 0;
  const posY = activeScene?.positionY ?? 0;
  const rawFontSize = activeScene?.fontSize ?? 88;
  const rawLineHeight = activeScene?.lineHeight ?? 1.3;

  // Track player canvas scale to match font size accurately
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setCanvasScale(rect.width / compWidth);
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [compWidth]);

  // Adjust textarea height automatically to fit content perfectly
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [activeScene?.text, canvasScale, isSelected, adjustTextareaHeight]);

  // Click outside listener: deselect and close the drag box when clicking outside
  useEffect(() => {
    const onWindowPointerDown = (e: PointerEvent) => {
      if (isDraggingRef.current) return;
      // If clicking outside the box, close the drag/edit box
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setIsSelected(false);
        setIsFocused(false);
      }
    };

    window.addEventListener("pointerdown", onWindowPointerDown);
    return () => window.removeEventListener("pointerdown", onWindowPointerDown);
  }, []);

  // When player plays, automatically deselect/hide the drag box for clean video preview
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => {
      setIsSelected(false);
      setIsFocused(false);
    };

    player.addEventListener("play", onPlay);
    return () => {
      player.removeEventListener("play", onPlay);
    };
  }, [playerRef]);

  // Escape key to deselect and close box
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSelected(false);
        setIsFocused(false);
        textareaRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // While selected, the on-canvas overlay renders the text, so blank out the
  // Remotion-rendered text for that same scene to eliminate duplication.
  // When deselected, Remotion renders the text with 100% video animation fidelity.
  const scenesForPlayer = useMemo(() => {
    if (!isSelected || !activeScene) return scenes;
    return scenes.map((s, idx) => {
      if (idx === activeSceneIndex) {
        return { ...s, text: "" };
      }
      return s;
    });
  }, [scenes, activeScene, activeSceneIndex, isSelected]);

  // High performance direct dragging handler with magnetic snapping and crosshair guides
  const handleStartDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!onUpdatePosition || !containerRef.current || !activeScene) return;

      if (playerRef.current && playerRef.current.isPlaying()) {
        playerRef.current.pause();
      }

      setIsSelected(true);
      setIsDragging(true);
      isDraggingRef.current = true;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / compWidth;
      const scaleY = rect.height / compHeight;

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startPosX = posX;
      const startPosY = posY;
      // Capture the pre-drag state once so a single undo restores the original position.
      onUpdatePosition(startPosX, startPosY, true);

      let rafId: number | null = null;
      let latestX = startPosX;
      let latestY = startPosY;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaClientX = moveEvent.clientX - startClientX;
        const deltaClientY = moveEvent.clientY - startClientY;

        const rawX = Math.round(startPosX + deltaClientX / scaleX);
        const rawY = Math.round(startPosY + deltaClientY / scaleY);

        const snapThreshold = 14;
        const isSnapX = Math.abs(rawX) < snapThreshold;
        const isSnapY = Math.abs(rawY) < snapThreshold;

        latestX = isSnapX ? 0 : rawX;
        latestY = isSnapY ? 0 : rawY;

        const clampedX = Math.max(-550, Math.min(550, latestX));
        const clampedY = Math.max(-450, Math.min(450, latestY));

        setSnapGuides({ x: isSnapX, y: isSnapY });

        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          onUpdatePosition(clampedX, clampedY, false);
        });
      };

      const onPointerUp = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        setIsDragging(false);
        isDraggingRef.current = false;
        setSnapGuides({ x: false, y: false });

        const clampedX = Math.max(-550, Math.min(550, latestX));
        const clampedY = Math.max(-450, Math.min(450, latestY));
        onUpdatePosition(clampedX, clampedY, false);

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [activeScene, compHeight, compWidth, onUpdatePosition, playerRef, posX, posY]
  );

  // Center position relative to container
  const handlePercentX = 50 + (posX / compWidth) * 100;
  const handlePercentY = 50 + (posY / compHeight) * 100;

  // Exact matching font size and container dimensions scaled from Remotion composition
  const displayFontSize = Math.max(14, rawFontSize * canvasScale);
  const paddingScaled = 120 * canvasScale;
  const maxContentWidth = Math.max(260, (compWidth - 240) * 0.9 * canvasScale);

  const isDeadCenter = posX === 0 && posY === 0;

  return (
    <div
      ref={containerRef}
      className="relative max-h-full max-w-full rounded-xl overflow-hidden border border-white/10 bg-black select-none shadow-2xl flex items-center justify-center group"
      style={{
        aspectRatio: `${compWidth} / ${compHeight}`,
        height: "100%",
        width: "auto",
      }}
    >
      {/* 1. Remotion Player Canvas */}
      <Player
        ref={playerRef}
        component={KineticCast}
        inputProps={{ scenes: scenesForPlayer, background, backgroundColor }}
        durationInFrames={Math.max(1, totalDurationInFrames)}
        fps={30}
        compositionWidth={compWidth}
        compositionHeight={compHeight}
        style={{ width: "100%", height: "100%" }}
        controls={false}
      />

      {/* ========================================================================= */}
      {/* SMART CENTER CROSSHAIR GUIDELINES (+)                                     */}
      {/* ========================================================================= */}
      {isDragging && snapGuides.x && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#00b4d8] shadow-[0_0_10px_rgba(0,180,216,1)] pointer-events-none z-20" />
      )}

      {isDragging && snapGuides.y && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#00b4d8] shadow-[0_0_10px_rgba(0,180,216,1)] pointer-events-none z-20" />
      )}

      {isDragging && snapGuides.x && snapGuides.y && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#00b4d8] bg-[#00b4d8]/30 shadow-[0_0_12px_rgba(0,180,216,1)] flex items-center justify-center pointer-events-none z-25 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INACTIVE STATE: Transparent Hit Area to select on click                */}
      {/* ========================================================================= */}
      {activeScene && !isSelected && (
        <div
          style={{
            left: `${handlePercentX}%`,
            top: `${handlePercentY}%`,
            transform: "translate(-50%, -50%)",
            rotate: `${activeScene.rotation ?? 0}deg`,
            width: `${maxContentWidth}px`,
            maxWidth: `calc(100% - ${paddingScaled * 2}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsSelected(true);
          }}
          className="absolute z-20 cursor-pointer rounded-sm hover:ring-1 hover:ring-[#00b4d8]/50 p-2 transition-all group/hit"
          title="Click to select text, drag position, or edit"
        >
          {/* Subtle hover outline indicator */}
          <div className="w-full text-transparent font-bold select-none text-center" style={{ fontSize: `${displayFontSize}px`, lineHeight: rawLineHeight }}>
            {activeScene.text || "Scene Text"}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE STATE: Selected Drag & Inline Edit Box                          */}
      {/* ========================================================================= */}
      {activeScene && isSelected && (
        <div
          ref={boxRef}
          style={{
            left: `${handlePercentX}%`,
            top: `${handlePercentY}%`,
            transform: "translate(-50%, -50%)",
            width: `${maxContentWidth}px`,
            maxWidth: `calc(100% - ${paddingScaled * 2}px)`,
          }}
          className={`absolute z-30 pointer-events-auto rounded-sm border-[1.5px] border-[#00b4d8] bg-transparent p-1 transition-none select-none ${
            isDragging ? "ring-2 ring-[#00b4d8] shadow-2xl cursor-grabbing" : ""
          }`}
        >
          {/* Top, Bottom, and Left Draggable Border Grips */}
          <div
            onPointerDown={handleStartDrag}
            className="absolute inset-x-0 -top-2.5 h-3 cursor-move z-40 touch-none"
            title="Drag to reposition text"
          />
          <div
            onPointerDown={handleStartDrag}
            className="absolute inset-x-0 -bottom-2.5 h-3 cursor-move z-40 touch-none"
            title="Drag to reposition text"
          />
          <div
            onPointerDown={handleStartDrag}
            className="absolute inset-y-0 -left-2.5 w-3 cursor-move z-40 touch-none"
            title="Drag to reposition text"
          />

          {/* 4 Corner Handles (Grip markers matching user screenshot) */}
          {[
            { pos: "-top-1.5 -left-1.5", cursor: "cursor-nwse-resize" },
            { pos: "-top-1.5 -right-1.5", cursor: "cursor-nesw-resize" },
            { pos: "-bottom-1.5 -left-1.5", cursor: "cursor-nesw-resize" },
            { pos: "-bottom-1.5 -right-1.5", cursor: "cursor-nwse-resize" },
          ].map(({ pos, cursor }) => (
            <div
              key={pos}
              onPointerDown={handleStartDrag}
              className={`absolute ${pos} ${cursor} z-40 h-3 w-3 touch-none rounded-[3px] border-[1.5px] border-[#00b4d8] bg-white shadow-md`}
              title="Drag to reposition text"
            />
          ))}

          {/* DIRECT EDITABLE TEXTAREA: Type immediately! */}
          <textarea
            ref={textareaRef}
            value={activeScene.text}
            onChange={(e) => {
              onUpdateText?.(activeSceneIndex, e.target.value);
              adjustTextareaHeight();
            }}
            onFocus={() => {
              setIsFocused(true);
              if (playerRef.current && playerRef.current.isPlaying()) {
                playerRef.current.pause();
              }
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
                e.preventDefault();
                setIsSelected(false);
                setIsFocused(false);
                textareaRef.current?.blur();
              }
            }}
            rows={1}
            spellCheck={false}
            className="w-full border-none outline-none resize-none p-0 m-0 leading-snug caret-[#00b4d8] overflow-hidden text-center cursor-text block"
            style={{
              fontSize: `${displayFontSize}px`,
              lineHeight: rawLineHeight,
              fontFamily: getFontFamilyCss(activeScene.fontFamily),
              color: activeScene.textColor || "#FFFFFF",
              fontWeight: activeScene.bold ? 700 : activeScene.fontWeight ?? 700,
              fontStyle: activeScene.italic ? "italic" : "normal",
              textDecoration: activeScene.underline ? "underline" : "none",
              letterSpacing: `${activeScene.letterSpacing ?? 0}px`,
              opacity: activeScene.opacity ?? 1,
              backgroundColor: activeScene.textBackgroundColor ?? "transparent",
              WebkitTextStroke: activeScene.textStroke ?? undefined,
              textShadow: activeScene.textShadow ? "0 4px 12px rgba(0,0,0,.65)" : undefined,
              textAlign: activeScene.textAlign || "center",
              wordBreak: "break-word",
            }}
            placeholder="Click to type text..."
          />

          {/* Live Drag Coordinate / Center Snapped Tooltip */}
          {isDragging && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#00b4d8] text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap">
              {isDeadCenter ? "🎯 Center (0, 0)" : `X: ${posX >= 0 ? `+${posX}` : posX}  Y: ${posY >= 0 ? `+${posY}` : posY}`}
            </div>
          )}

          {/* Right Circular Move Handle (✥) */}
          <div
            onPointerDown={handleStartDrag}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#00b4d8] text-white flex items-center justify-center cursor-move shadow-md hover:scale-110 active:scale-95 transition-transform z-40 touch-none select-none"
            title="Drag to reposition text"
          >
            <Move size={13} className="stroke-[2.5]" />
          </div>

          {/* Top-Right Close / Deselect Handle (✕) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSelected(false);
              setIsFocused(false);
            }}
            className="absolute -top-3 right-4 h-5 w-5 rounded-full bg-[#1e293b] text-white border border-[#00b4d8]/60 flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all z-40"
            title="Deselect / Close box"
          >
            <X size={10} className="stroke-[2.5]" />
          </button>

          {/* Bottom Right Trash Handle (🗑) - Clear text */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateText?.(activeSceneIndex, "");
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-[3px] bg-[#00b4d8] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-red-500 hover:scale-110 active:scale-95 transition-all z-40"
            title="Clear text"
          >
            <Trash2 size={11} className="stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
}
