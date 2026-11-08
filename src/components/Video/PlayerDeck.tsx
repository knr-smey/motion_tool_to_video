"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Maximize2,
  Move,
} from "lucide-react";
import { KineticStage, type AspectRatio } from "./KineticStage";
import type { Scene } from "@/lib/segmentation";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";
import { withStartFrames } from "@/remotion/Composition";

interface PlayerDeckProps {
  scenes: Scene[];
  totalDurationInFrames: number;
  fps: number;
  background: BackgroundConfig;
  backgroundColor?: string;
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onUpdatePosition?: (x: number, y: number, isFinal?: boolean) => void;
  onUpdateText?: (index: number, newText: string) => void;
  aspectRatio?: AspectRatio;
  onSelectScene?: (index: number) => void;
}

export function PlayerDeck({
  scenes,
  totalDurationInFrames,
  fps,
  background,
  backgroundColor = "#000000",
  playerRef,
  activeSceneIndex = 0,
  onUpdatePosition,
  onUpdateText,
  aspectRatio = "16:9",
  onSelectScene,
}: PlayerDeckProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [playerRef]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  }, [playerRef]);

  const skipToPrevScene = useCallback(() => {
    if (scenes.length === 0) return;
    const prevIndex = Math.max(0, activeSceneIndex - 1);
    const positioned = withStartFrames(scenes);
    const target = positioned[prevIndex];
    if (target && playerRef.current) {
      playerRef.current.seekTo(target.from);
      onSelectScene?.(prevIndex);
    }
  }, [activeSceneIndex, onSelectScene, playerRef, scenes]);

  const skipToNextScene = useCallback(() => {
    if (scenes.length === 0) return;
    const nextIndex = Math.min(scenes.length - 1, activeSceneIndex + 1);
    const positioned = withStartFrames(scenes);
    const target = positioned[nextIndex];
    if (target && playerRef.current) {
      playerRef.current.seekTo(target.from);
      onSelectScene?.(nextIndex);
    }
  }, [activeSceneIndex, onSelectScene, playerRef, scenes]);

  const toggleFullscreen = useCallback(() => {
    const stage = document.getElementById("canvas-stage-wrapper");
    if (!stage) return;
    if (!document.fullscreenElement) {
      stage.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div className="flex w-full h-full flex-col items-center justify-between min-h-0 py-2">
      {/* Video Canvas Stage */}
      <div
        id="canvas-stage-wrapper"
        className="flex-1 w-full min-h-0 flex items-center justify-center p-2 overflow-hidden"
      >
        <KineticStage
          scenes={scenes}
          totalDurationInFrames={totalDurationInFrames}
          aspectRatio={aspectRatio}
          background={background}
          backgroundColor={backgroundColor}
          playerRef={playerRef}
          activeSceneIndex={activeSceneIndex}
          onUpdatePosition={onUpdatePosition}
          onUpdateText={onUpdateText}
        />
      </div>

      {/* Centered Minimal Playback Controls (Matching Reference Screenshot) */}
      <div className="w-full max-w-4xl px-4 flex items-center justify-between shrink-0 h-10 select-none">
        {/* Left: Reset Position to Center Button */}
        <button
          type="button"
          onClick={() => onUpdatePosition?.(0, 0)}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted hover:text-white hover:bg-white/5 border border-border/40 transition cursor-pointer"
          title="Reset text position to center (0, 0)"
        >
          <Move size={12} className="text-[#00b4d8]" />
          <span>Center Text</span>
        </button>

        {/* Center: |<<  ▶/❚❚  >>| */}
        <div className="flex items-center gap-3">
          {/* Skip Previous Scene */}
          <button
            type="button"
            onClick={skipToPrevScene}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Previous scene"
          >
            <SkipBack size={15} />
          </button>

          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition shadow-lg cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={17} className="fill-black" />
            ) : (
              <Play size={17} className="fill-black" />
            )}
          </button>

          {/* Skip Next Scene */}
          <button
            type="button"
            onClick={skipToNextScene}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Next scene"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Right: Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}
