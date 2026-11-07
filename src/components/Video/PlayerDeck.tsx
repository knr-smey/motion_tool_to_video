"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { Pause, Play, RectangleHorizontal, RectangleVertical, RotateCcw } from "lucide-react";
import { KineticStage, type AspectRatio } from "./KineticStage";
import type { Scene } from "@/lib/segmentation";

interface PlayerDeckProps {
  scenes: Scene[];
  totalDurationInFrames: number;
}

export function PlayerDeck({ scenes, totalDurationInFrames }: PlayerDeckProps) {
  const playerRef = useRef<PlayerRef>(null);
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
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  }, []);

  const restart = useCallback(() => {
    playerRef.current?.seekTo(0);
  }, []);

  const scrub = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    playerRef.current?.seekTo(Number(event.target.value));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <KineticStage
        scenes={scenes}
        totalDurationInFrames={totalDurationInFrames}
        aspectRatio={aspectRatio}
        playerRef={playerRef}
      />

      <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          type="button"
          onClick={restart}
          className="p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
          aria-label="Restart"
        >
          <RotateCcw size={20} />
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(1, totalDurationInFrames - 1)}
          value={frame}
          onChange={scrub}
          className="flex-1 accent-black"
        />

        <div className="flex border-2 border-black rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => setAspectRatio("16:9")}
            className={`p-2 transition-colors ${
              aspectRatio === "16:9" ? "bg-black text-white" : "hover:bg-neutral-200"
            }`}
            aria-label="16:9 landscape"
          >
            <RectangleHorizontal size={20} />
          </button>
          <button
            type="button"
            onClick={() => setAspectRatio("9:16")}
            className={`p-2 transition-colors ${
              aspectRatio === "9:16" ? "bg-black text-white" : "hover:bg-neutral-200"
            }`}
            aria-label="9:16 portrait"
          >
            <RectangleVertical size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
