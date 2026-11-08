"use client";

import { useCallback, useRef, type RefObject } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { KineticCast } from "@/remotion/Composition";
import type { Scene } from "@/lib/segmentation";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";

export type AspectRatio = "16:9" | "9:16";

const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

interface KineticStageProps {
  scenes: Scene[];
  totalDurationInFrames: number;
  aspectRatio: AspectRatio;
  background: BackgroundConfig;
  backgroundColor?: string;
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onUpdatePosition?: (x: number, y: number) => void;
  showGuide?: boolean;
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
  showGuide = false,
}: KineticStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: compWidth, height: compHeight } = DIMENSIONS[aspectRatio];

  const activeScene = scenes[activeSceneIndex];
  const posX = activeScene?.positionX ?? 0;
  const posY = activeScene?.positionY ?? 0;

  // On-canvas direct dragging handler
  const handlePointerDownOnCanvas = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!onUpdatePosition || !containerRef.current || !activeScene) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / compWidth;
      const scaleY = rect.height / compHeight;

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startPosX = posX;
      const startPosY = posY;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaClientX = moveEvent.clientX - startClientX;
        const deltaClientY = moveEvent.clientY - startClientY;

        const newX = Math.round(startPosX + deltaClientX / scaleX);
        const newY = Math.round(startPosY + deltaClientY / scaleY);

        // Clamp to sensible range
        const clampedX = Math.max(-500, Math.min(500, newX));
        const clampedY = Math.max(-400, Math.min(400, newY));

        onUpdatePosition(clampedX, clampedY);
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [activeScene, compHeight, compWidth, onUpdatePosition, posX, posY]
  );

  // Position of handle relative to container center
  const handlePercentX = 50 + (posX / compWidth) * 100;
  const handlePercentY = 50 + (posY / compHeight) * 100;

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
      <Player
        ref={playerRef}
        component={KineticCast}
        inputProps={{ scenes, background, backgroundColor }}
        durationInFrames={Math.max(1, totalDurationInFrames)}
        fps={30}
        compositionWidth={compWidth}
        compositionHeight={compHeight}
        style={{ width: "100%", height: "100%" }}
        controls={false}
      />

      {/* On-Canvas Bounding Box with 8 Handles (Reference UI style) */}
      {showGuide && activeScene && (
        <div
          style={{
            left: `${handlePercentX}%`,
            top: `${handlePercentY}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={handlePointerDownOnCanvas}
          className="absolute z-20 cursor-grab active:cursor-grabbing pointer-events-auto touch-none"
          title="Drag to reposition text on canvas"
        >
          {/* Bounding Box Frame */}
          <div className="relative min-w-[200px] max-w-[420px] px-4 py-2.5 rounded border border-white/90 bg-white/[0.04] backdrop-blur-[1px] shadow-sm">
            {/* 8 Resize/Move Circular Dots */}
            {/* Top-Left */}
            <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />
            {/* Top-Center */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />
            {/* Top-Right */}
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />

            {/* Middle-Left */}
            <span className="absolute top-1/2 -left-1 -translate-y-1/2 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />
            {/* Middle-Right */}
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />

            {/* Bottom-Left */}
            <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />
            {/* Bottom-Center */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />
            {/* Bottom-Right */}
            <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-white ring-1 ring-black/40 shadow-sm" />

            {/* Drag Handle Label */}
            <div className="flex items-center justify-between text-[10px] font-medium text-white/90 truncate gap-2">
              <span className="truncate">{activeScene.text || "Text Box"}</span>
              <span className="text-[9px] font-mono text-white/60 tabular-nums shrink-0">
                {posX >= 0 ? `+${posX}` : posX}, {posY >= 0 ? `+${posY}` : posY}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
