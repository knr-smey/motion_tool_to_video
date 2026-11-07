"use client";

import { useCallback, useRef, type RefObject } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Move } from "lucide-react";
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
  playerRef,
  activeSceneIndex = 0,
  onUpdatePosition,
  showGuide = true,
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
        const clampedX = Math.max(-400, Math.min(400, newX));
        const clampedY = Math.max(-300, Math.min(300, newY));

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
  // Center is at 50%, 50%
  // Offset in percent: (posX / compWidth) * 100%
  const handlePercentX = 50 + (posX / compWidth) * 100;
  const handlePercentY = 50 + (posY / compHeight) * 100;

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto rounded-lg overflow-hidden border border-border bg-black select-none shadow-lg"
    >
      <Player
        ref={playerRef}
        component={KineticCast}
        inputProps={{ scenes, background }}
        durationInFrames={Math.max(1, totalDurationInFrames)}
        fps={30}
        compositionWidth={compWidth}
        compositionHeight={compHeight}
        style={{ width: "100%" }}
        controls={false}
      />

      {/* On-Canvas Draggable Guide Handle */}
      {showGuide && activeScene && (
        <div
          style={{
            left: `${handlePercentX}%`,
            top: `${handlePercentY}%`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={handlePointerDownOnCanvas}
          className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center pointer-events-auto touch-none"
          title="Drag to position scene text"
        >
          {/* Draggable Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-accent/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-accent-foreground shadow-xl ring-2 ring-white/20 transition-transform hover:scale-105 active:scale-95">
            <Move size={12} />
            <span className="font-mono text-[11px] tabular-nums">
              Drag ({posX >= 0 ? `+${posX}` : posX}, {posY >= 0 ? `+${posY}` : posY})
            </span>
          </div>

          {/* Target Reticle Indicator */}
          <div className="mt-1 h-3 w-3 rounded-full border-2 border-accent/80 bg-accent/30 animate-pulse pointer-events-none" />
        </div>
      )}
    </div>
  );
}
