"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Pause, Play, RectangleHorizontal, RectangleVertical, RotateCcw } from "lucide-react";
import { KineticStage, type AspectRatio } from "./KineticStage";
import type { Scene } from "@/lib/segmentation";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";

interface PlayerDeckProps {
  scenes: Scene[];
  totalDurationInFrames: number;
  fps: number;
  background: BackgroundConfig;
  playerRef: RefObject<PlayerRef | null>;
}

function formatTime(frame: number, fps: number): string {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frameRemainder = frame % fps;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frameRemainder.toString().padStart(2, "0")}`;
}

export function PlayerDeck({
  scenes,
  totalDurationInFrames,
  fps,
  background,
  playerRef,
}: PlayerDeckProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFrameUpdate = () => setFrame(player.getCurrentFrame());

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("frameupdate", onFrameUpdate);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [playerRef]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  }, [playerRef]);

  const restart = useCallback(() => {
    playerRef.current?.seekTo(0);
  }, [playerRef]);

  const scrub = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      playerRef.current?.seekTo(Number(event.target.value));
    },
    [playerRef]
  );

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <KineticStage
        scenes={scenes}
        totalDurationInFrames={totalDurationInFrames}
        aspectRatio={aspectRatio}
        background={background}
        playerRef={playerRef}
      />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="tabular-nums">{formatTime(frame, fps)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, totalDurationInFrames - 1)}
          value={frame}
          onChange={scrub}
          className="h-1 flex-1 accent-accent"
        />
        <span className="tabular-nums">{formatTime(totalDurationInFrames, fps)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={restart}
            className="rounded-full p-2 text-foreground transition-colors hover:bg-surface-raised"
            aria-label="Restart"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="rounded-full bg-accent p-2 text-accent-foreground transition-opacity hover:opacity-90"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>

        <div className="flex overflow-hidden rounded-full border border-border">
          <button
            type="button"
            onClick={() => setAspectRatio("16:9")}
            className={`p-2 transition-colors ${
              aspectRatio === "16:9"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-raised"
            }`}
            aria-label="16:9 landscape"
          >
            <RectangleHorizontal size={18} />
          </button>
          <button
            type="button"
            onClick={() => setAspectRatio("9:16")}
            className={`p-2 transition-colors ${
              aspectRatio === "9:16"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-raised"
            }`}
            aria-label="9:16 portrait"
          >
            <RectangleVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
