"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import {
  Scissors,
  Copy,
  Lock,
  Unlock,
  Trash2,
  Minus,
  Plus,
  Play,
  Pause,
  Mic,
  Maximize2,
  Type,
  Music,
  Film,
  Subtitles as SubtitlesIcon,
  GripVertical,
} from "lucide-react";
import type { Scene } from "@/lib/segmentation";
import { withStartFrames } from "@/remotion/Composition";

interface ScenePlaylistProps {
  scenes: Scene[];
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onSelectScene?: (index: number) => void;
  onOpenRecordModal?: (index: number) => void;
  onDuplicateScene?: (index: number) => void;
  onDeleteScene?: (index: number) => void;
  onSplitScene?: (index: number) => void;
  onUpdateSceneDuration?: (index: number, newDurationSeconds: number) => void;
}

function formatTimelineTime(frame: number, fps = 30): string {
  const totalSeconds = frame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.floor((totalSeconds % 1) * 100);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

export function ScenePlaylist({
  scenes,
  playerRef,
  activeSceneIndex = 0,
  onSelectScene,
  onOpenRecordModal,
  onDuplicateScene,
  onDeleteScene,
  onSplitScene,
  onUpdateSceneDuration,
}: ScenePlaylistProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // 0.6x to 2x zoom
  const [isLocked, setIsLocked] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  
  // Drag to resize scene duration state
  const [resizingState, setResizingState] = useState<{
    index: number;
    currentDuration: number;
  } | null>(null);

  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayhead = useRef(false);
  const isResizingDuration = useRef(false);

  const FPS = 30;
  const basePxPerSecond = 80 * zoomLevel;
  const positioned = withStartFrames(scenes);
  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  const totalSeconds = totalDurationInFrames / FPS;

  // Listen to player frame update to update playhead position
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = () => {
      if (!isDraggingPlayhead.current && !isResizingDuration.current) {
        setCurrentFrame(player.getCurrentFrame());
      }
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [playerRef]);

  // Sync active scene when current frame changes
  useEffect(() => {
    if (scenes.length === 0 || isResizingDuration.current) return;
    const foundIdx = positioned.findIndex(
      (p) => currentFrame >= p.from && currentFrame < p.from + p.scene.durationInFrames
    );
    if (foundIdx !== -1 && foundIdx !== activeSceneIndex && onSelectScene) {
      onSelectScene(foundIdx);
    }
  }, [currentFrame, positioned, activeSceneIndex, onSelectScene, scenes.length]);

  // Scrubbing on Timeline
  const handleSeekFromClientX = useCallback(
    (clientX: number) => {
      if (!timelineBodyRef.current || totalDurationInFrames <= 0) return;
      const rect = timelineBodyRef.current.getBoundingClientRect();
      const scrollLeft = timelineBodyRef.current.scrollLeft;
      const offsetX = clientX - rect.left + scrollLeft;
      const targetSec = Math.max(0, offsetX / basePxPerSecond);
      const targetFrame = Math.min(
        totalDurationInFrames,
        Math.max(0, Math.round(targetSec * FPS))
      );

      setCurrentFrame(targetFrame);
      if (playerRef.current) {
        playerRef.current.seekTo(targetFrame);
      }
    },
    [basePxPerSecond, playerRef, totalDurationInFrames]
  );

  const handlePointerDownTimeline = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isResizingDuration.current) return;
    isDraggingPlayhead.current = true;
    handleSeekFromClientX(e.clientX);

    const onPointerMove = (me: PointerEvent) => {
      if (isDraggingPlayhead.current && !isResizingDuration.current) {
        handleSeekFromClientX(me.clientX);
      }
    };

    const onPointerUp = () => {
      isDraggingPlayhead.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Drag to resize / trim scene duration handler
  const handleStartResize = useCallback(
    (e: React.PointerEvent, index: number, initialDuration: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (!onUpdateSceneDuration) return;

      isResizingDuration.current = true;
      const startX = e.clientX;
      let lastDuration = initialDuration;
      setResizingState({ index, currentDuration: initialDuration });

      const onPointerMove = (moveEvt: PointerEvent) => {
        const deltaPx = moveEvt.clientX - startX;
        const deltaSeconds = deltaPx / basePxPerSecond;
        const newDuration = Math.max(
          0.5,
          Math.min(30, Math.round((initialDuration + deltaSeconds) * 10) / 10)
        );

        if (newDuration !== lastDuration) {
          lastDuration = newDuration;
          setResizingState({ index, currentDuration: newDuration });
          onUpdateSceneDuration(index, newDuration);
        }
      };

      const onPointerUp = () => {
        isResizingDuration.current = false;
        setResizingState(null);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [basePxPerSecond, onUpdateSceneDuration]
  );

  const toggleAudioPreview = (e: React.MouseEvent, index: number, audioUrl: string) => {
    e.stopPropagation();
    if (playingAudioIndex === index) {
      setPlayingAudioIndex(null);
    } else {
      const audio = new window.Audio(audioUrl);
      audio.onended = () => setPlayingAudioIndex(null);
      audio.play();
      setPlayingAudioIndex(index);
    }
  };

  const playheadX = (currentFrame / FPS) * basePxPerSecond;
  const timelineTotalWidth = Math.max(900, totalSeconds * basePxPerSecond + 160);

  // Second ticks generation
  const tickInterval = zoomLevel < 0.8 ? 4 : zoomLevel > 1.4 ? 1 : 2;
  const numTicks = Math.ceil(totalSeconds / tickInterval) + 4;
  const ticks = Array.from({ length: numTicks }, (_, i) => i * tickInterval);

  return (
    <div className="w-full border-t border-border/80 bg-[#141418] select-none flex flex-col shrink-0 h-64 shadow-2xl">
      {/* 1. TIMELINE TOP TOOLBAR */}
      <div className="flex h-10 items-center justify-between border-b border-border/60 px-4 bg-[#111114]">
        {/* Left Editing Tools */}
        <div className="flex items-center gap-1">
          {/* Split */}
          <button
            type="button"
            onClick={() => onSplitScene?.(activeSceneIndex)}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Split scene at current position"
          >
            <Scissors size={14} />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => onDuplicateScene?.(activeSceneIndex)}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Duplicate selected scene"
          >
            <Copy size={14} />
          </button>

          {/* Lock */}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex h-7 w-7 items-center justify-center rounded transition cursor-pointer ${
              isLocked
                ? "text-accent bg-accent/20"
                : "text-foreground/70 hover:text-white hover:bg-white/10"
            }`}
            title={isLocked ? "Unlock track" : "Lock track"}
          >
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>

          {/* Delete Scene */}
          <button
            type="button"
            onClick={() => onDeleteScene?.(activeSceneIndex)}
            disabled={scenes.length <= 1}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground/70 hover:text-red-400 hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete selected scene"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Center: Exact Timecode */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground/80 tracking-wider">
          <span className="font-semibold text-white">
            {formatTimelineTime(currentFrame, FPS)}
          </span>
          <span className="text-muted/60">/</span>
          <span className="text-muted">
            {formatTimelineTime(totalDurationInFrames, FPS)}
          </span>
        </div>

        {/* Right: Zoom slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={13} />
          </button>

          <input
            type="range"
            min={0.6}
            max={2.0}
            step={0.1}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-20 h-1 accent-accent bg-surface-raised cursor-pointer"
          />

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* 2. TIMELINE TRACKS AREA (Horizontally Scrollable) */}
      <div
        ref={timelineBodyRef}
        onPointerDown={handlePointerDownTimeline}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-crosshair pb-2 select-none scrollbar-thin bg-[#121216]"
      >
        <div
          className="relative min-h-full flex flex-col"
          style={{ width: `${timelineTotalWidth}px` }}
        >
          {/* Time Ruler with Second Ticks */}
          <div className="h-6 w-full border-b border-border/40 flex items-end relative text-[10px] text-muted/70 font-mono pointer-events-none">
            {ticks.map((sec) => {
              const tickX = sec * basePxPerSecond;
              return (
                <div
                  key={sec}
                  style={{ left: `${tickX}px` }}
                  className="absolute bottom-0 flex flex-col items-start pl-1"
                >
                  <span className="leading-none pb-0.5">
                    {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, "0")}
                  </span>
                  <div className="h-2 w-px bg-border/80" />
                </div>
              );
            })}
          </div>

          {/* Interactive Playhead Needle traversing all tracks */}
          <div
            style={{ left: `${playheadX}px` }}
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
          >
            {/* White playhead marker head */}
            <div className="w-3 h-3 bg-white rounded-b-sm shadow-md flex items-center justify-center -translate-y-0.5">
              <span className="w-1 h-1 bg-black rounded-full" />
            </div>
            {/* White vertical needle line */}
            <div className="w-[1.5px] flex-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </div>

          {/* TRACK 1: Text Track (Purple #8B5CF6 / #a78bfa) */}
          <div className="h-9 w-full flex items-center px-1 py-0.5 relative mt-1">
            {positioned.map(({ scene, from }, index) => {
              const width = Math.max(65, scene.durationSeconds * basePxPerSecond);
              const isSelected = index === activeSceneIndex;
              const isBeingResized = resizingState?.index === index;

              return (
                <div
                  key={scene.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playerRef.current) playerRef.current.seekTo(from);
                    onSelectScene?.(index);
                  }}
                  style={{ width: `${width}px` }}
                  className={`h-full group relative flex items-center gap-1.5 px-2.5 rounded-md font-sans text-xs transition cursor-pointer truncate mr-1 shadow-sm select-none border ${
                    isSelected
                      ? "bg-[#9d7cf7] text-white border-white/80 ring-2 ring-[#9d7cf7]/50 font-semibold"
                      : "bg-[#7c5ce9]/80 hover:bg-[#7c5ce9] text-white/95 border-purple-400/30"
                  }`}
                  title={scene.text}
                >
                  <span className="font-bold font-serif text-[11px] shrink-0">T</span>
                  <span className="truncate text-[11px] font-medium pr-2">
                    {scene.text || "Scene Text"}
                  </span>

                  {/* Right Edge Drag-to-Resize Handle */}
                  <div
                    onPointerDown={(e) => handleStartResize(e, index, scene.durationSeconds)}
                    className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center hover:bg-white/20 active:bg-white/40 transition-colors z-20 group/handle rounded-r"
                    title="Drag to increase or decrease scene duration"
                  >
                    <div className="w-[2px] h-3.5 bg-white/50 group-hover/handle:bg-white rounded-full" />
                  </div>

                  {/* Resizing Duration Floating Tooltip */}
                  {isBeingResized && (
                    <div className="absolute -top-7 right-0 bg-black/90 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-lg border border-white/20 pointer-events-none z-40 whitespace-nowrap">
                      ⏱ {resizingState.currentDuration.toFixed(1)}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TRACK 2: Visuals Filmstrip Track (The exact block from user screenshot) */}
          <div className="h-12 w-full flex items-center px-1 py-1 relative">
            {positioned.map(({ scene, from }, index) => {
              const width = Math.max(65, scene.durationSeconds * basePxPerSecond);
              const isSelected = index === activeSceneIndex;
              const isBeingResized = resizingState?.index === index;

              return (
                <div
                  key={scene.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playerRef.current) playerRef.current.seekTo(from);
                    onSelectScene?.(index);
                  }}
                  style={{ width: `${width}px` }}
                  className={`h-full group relative flex items-center justify-between px-2.5 rounded-lg transition cursor-pointer mr-1 select-none border-2 ${
                    isSelected
                      ? "border-accent ring-1 ring-accent bg-zinc-800/90 shadow-md"
                      : "border-border/60 bg-zinc-900/90 hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-mono truncate">
                    <span className="font-bold text-white">#{index + 1}</span>
                    <span className="truncate text-zinc-400 text-[10px]">{scene.layout}</span>
                  </div>

                  {/* Two Dots from User's Screenshot •• */}
                  <div className="flex items-center gap-1 opacity-50 pr-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-400" />
                    <div className="w-2 h-2 rounded-full bg-zinc-400" />
                  </div>

                  {/* RIGHT EDGE DRAG HANDLE (Increase/Decrease with mouse) */}
                  <div
                    onPointerDown={(e) => handleStartResize(e, index, scene.durationSeconds)}
                    className="absolute right-0 top-0 bottom-0 w-3.5 cursor-ew-resize flex items-center justify-center hover:bg-accent/25 active:bg-accent/40 transition-colors z-20 group/handle rounded-r"
                    title="Drag right or left with mouse to increase or decrease duration"
                  >
                    <div className="w-[3px] h-5 bg-zinc-500 group-hover/handle:bg-accent group-hover/handle:scale-y-110 transition-all rounded-full" />
                  </div>

                  {/* Active Drag Duration Tooltip */}
                  {isBeingResized && (
                    <div className="absolute -top-7 right-0 bg-[#f1591f] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-white/20 pointer-events-none z-40 whitespace-nowrap animate-pulse">
                      ⏱ {resizingState.currentDuration.toFixed(1)}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TRACK 3: Voiceover Audio Track (Emerald #10B981) */}
          <div className="h-9 w-full flex items-center px-1 py-0.5 relative">
            {positioned.map(({ scene, from }, index) => {
              const width = Math.max(65, scene.durationSeconds * basePxPerSecond);
              const hasAudio = !!scene.audioUrl;
              const isSelected = index === activeSceneIndex;

              if (hasAudio) {
                return (
                  <div
                    key={scene.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playerRef.current) playerRef.current.seekTo(from);
                      onSelectScene?.(index);
                    }}
                    style={{ width: `${width}px` }}
                    className={`h-full flex items-center justify-between px-2.5 rounded-md transition cursor-pointer mr-1 shadow-sm border ${
                      isSelected
                        ? "bg-[#10b981] text-black border-white ring-2 ring-emerald-400/50"
                        : "bg-[#059669]/90 hover:bg-[#059669] text-white border-emerald-400/30"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        type="button"
                        onClick={(e) => toggleAudioPreview(e, index, scene.audioUrl!)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-current transition shrink-0"
                      >
                        {playingAudioIndex === index ? <Pause size={9} /> : <Play size={9} />}
                      </button>
                      <span className="text-[10px] font-medium truncate">
                        Voice #{index + 1}.mp3
                      </span>
                    </div>

                    {/* Audio Waveform Bars */}
                    <div className="flex items-center gap-0.5 h-3 opacity-90 shrink-0 ml-1">
                      {[30, 80, 45, 100, 60, 90, 40, 75, 50, 95, 30].map((h, bi) => (
                        <div
                          key={bi}
                          style={{ height: `${h}%` }}
                          className={`w-[2px] rounded-full ${
                            isSelected ? "bg-black" : "bg-emerald-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              // No audio recorded placeholder (dashed border from screenshot)
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRecordModal?.(index);
                  }}
                  style={{ width: `${width}px` }}
                  className="h-full flex items-center justify-center gap-1.5 px-2 rounded-md border border-dashed border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 transition cursor-pointer mr-1 text-[10px] font-medium truncate"
                  title="Record voiceover for this scene"
                >
                  <Mic size={11} />
                  <span className="truncate">+ Record Voice</span>
                </button>
              );
            })}
          </div>

          {/* TRACK 4: Subtitles Track */}
          <div className="h-8 w-full flex items-center px-1 py-0.5 relative">
            <div
              style={{
                width: `${Math.max(100, totalSeconds * basePxPerSecond)}px`,
              }}
              className="h-full flex items-center gap-2 px-3 rounded-md bg-[#38bdf8] text-slate-900 font-semibold text-[10px] shadow-sm truncate border border-sky-300/40"
            >
              <SubtitlesIcon size={12} className="shrink-0 text-slate-900" />
              <span className="truncate">
                Subtitles: {scenes[activeSceneIndex]?.text || "Speech Captions"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
