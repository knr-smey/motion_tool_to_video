"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { KineticCast } from "@/remotion/Composition";
import type { Scene } from "@/lib/segmentation";

export type AspectRatio = "16:9" | "9:16";

const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

interface KineticStageProps {
  scenes: Scene[];
  totalDurationInFrames: number;
  aspectRatio: AspectRatio;
  playerRef: React.RefObject<PlayerRef | null>;
}

export function KineticStage({
  scenes,
  totalDurationInFrames,
  aspectRatio,
  playerRef,
}: KineticStageProps) {
  const { width, height } = DIMENSIONS[aspectRatio];

  return (
    <div className="w-full max-w-3xl mx-auto border-2 border-black">
      <Player
        ref={playerRef}
        component={KineticCast}
        inputProps={{ scenes }}
        durationInFrames={Math.max(1, totalDurationInFrames)}
        fps={30}
        compositionWidth={width}
        compositionHeight={height}
        style={{ width: "100%" }}
        controls={false}
      />
    </div>
  );
}
