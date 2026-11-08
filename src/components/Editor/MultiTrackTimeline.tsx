"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import type { PlayerRef } from "@remotion/player";
import {
  Scissors,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Film,
  Music,
  Layers,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Plus,
} from "lucide-react";
import { useTimelineStore, timelineActions } from "@/lib/timelineStore";
import type { TimelineTrack, TimelineClip } from "@/types/timeline";

interface MultiTrackTimelineProps {
  playerRef: React.RefObject<PlayerRef | null>;
  totalDurationInFrames: number;
  fps: number;
}

export function MultiTrackTimeline({
  playerRef,
  totalDurationInFrames,
  fps = 30,
}: MultiTrackTimelineProps) {
  const tracks = useTimelineStore((s) => s.tracks);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const currentFrame = useTimelineStore((s) => s.currentFrame);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const zoom = useTimelineStore((s) => s.timelineZoom); // pixels per second

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);

  // Sync Remotion Player frame with timeline currentFrame
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      if (!isScrubbingRef.current) {
        timelineActions.setCurrentFrame(e.detail.frame);
      }
    };

    const onPlayStateChange = () => {
      timelineActions.setIsPlaying(player.isPlaying());
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("play", onPlayStateChange);
    player.addEventListener("pause", onPlayStateChange);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("play", onPlayStateChange);
      player.removeEventListener("pause", onPlayStateChange);
    };
  }, [playerRef]);

  // Handle Playhead Scrubbing on Timeline
  const handleTimelineScrub = useCallback(
    (e: React.PointerEvent) => {
      if (!timelineContainerRef.current) return;
      isScrubbingRef.current = true;

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const pixelsPerFrame = zoom / fps;

      const updateFrame = (clientX: number) => {
        const scrollLeft = timelineContainerRef.current?.scrollLeft ?? 0;
        const offsetX = clientX - rect.left + scrollLeft;
        const targetFrame = Math.max(
          0,
          Math.min(totalDurationInFrames, Math.round(offsetX / pixelsPerFrame))
        );

        timelineActions.setCurrentFrame(targetFrame);
        if (playerRef.current) {
          playerRef.current.seekTo(targetFrame);
        }
      };

      updateFrame(e.clientX);

      const onPointerMove = (moveEvt: PointerEvent) => {
        updateFrame(moveEvt.clientX);
      };

      const onPointerUp = () => {
        isScrubbingRef.current = false;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [fps, playerRef, totalDurationInFrames, zoom]
  );

  // Handle Clip Dragging on Timeline
  const handleStartClipDrag = (
    e: React.PointerEvent,
    clip: TimelineClip
  ) => {
    e.stopPropagation();
    timelineActions.selectClip(clip.id);

    const startX = e.clientX;
    const initialStartFrame = clip.startFrame;
    const pixelsPerFrame = zoom / fps;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);
      const newStartFrame = Math.max(0, initialStartFrame + deltaFrames);

      timelineActions.updateClipTiming(
        clip.id,
        newStartFrame,
        clip.durationInFrames
      );
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Handle Clip Edge Trimming
  const handleStartClipTrim = (
    e: React.PointerEvent,
    clip: TimelineClip,
    edge: "left" | "right"
  ) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialStart = clip.startFrame;
    const initialDuration = clip.durationInFrames;
    const pixelsPerFrame = zoom / fps;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);

      if (edge === "right") {
        const nextDuration = Math.max(5, initialDuration + deltaFrames);
        timelineActions.updateClipTiming(clip.id, clip.startFrame, nextDuration);
      } else {
        const nextStart = Math.max(0, initialStart + deltaFrames);
        const nextDuration = Math.max(5, initialDuration - (nextStart - initialStart));
        timelineActions.updateClipTiming(clip.id, nextStart, nextDuration);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Split selected clip at current playhead frame
  const handleSplit = () => {
    if (!selectedClipId) return;
    timelineActions.splitClip(selectedClipId, currentFrame);
  };

  // Delete selected clip
  const handleDelete = () => {
    if (!selectedClipId) return;
    timelineActions.deleteClip(selectedClipId);
  };

  // Toggle playback
  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const pixelsPerFrame = zoom / fps;
  const playheadPositionPx = currentFrame * pixelsPerFrame;
  const totalWidthPx = Math.max(1200, totalDurationInFrames * pixelsPerFrame + 400);

  // Time formatter: mm:ss.ff
  const formatTime = (f: number) => {
    const secTotal = f / fps;
    const m = Math.floor(secTotal / 60);
    const s = Math.floor(secTotal % 60);
    const ms = Math.floor((secTotal % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-72 border-t border-white/[0.08] bg-[#121316] flex flex-col select-none">
      {/* 1. TOP TIMELINE TOOLBAR */}
      <div className="h-10 px-4 border-b border-white/[0.08] flex items-center justify-between text-xs text-white/80 bg-[#16171b]">
        {/* Left: Quick Actions (Split, Delete, Play/Pause) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#f1591f] hover:bg-orange-600 text-white shadow transition cursor-pointer"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            type="button"
            onClick={handleSplit}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition text-[11px] font-semibold cursor-pointer ${
              selectedClipId
                ? "border-white/20 bg-[#1c1d22] text-white hover:border-[#f1591f]"
                : "border-transparent text-white/30 cursor-not-allowed"
            }`}
            title="Split Clip at Playhead (S)"
          >
            <Scissors size={12} />
            <span>Split</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition text-[11px] font-semibold cursor-pointer ${
              selectedClipId
                ? "border-white/20 bg-[#1c1d22] text-red-400 hover:border-red-500 hover:bg-red-500/10"
                : "border-transparent text-white/30 cursor-not-allowed"
            }`}
            title="Delete Selected Clip"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>

        {/* Center: Live Timecode & Frame Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-orange-400 font-bold">{formatTime(currentFrame)}</span>
          <span className="text-white/30">/</span>
          <span className="text-white/60">{formatTime(totalDurationInFrames)}</span>
          <span className="text-[10px] text-white/40 ml-1">({currentFrame}f)</span>
        </div>

        {/* Right: Zoom Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => timelineActions.setZoom(zoom - 10)}
            className="text-white/50 hover:text-white"
          >
            <ZoomOut size={13} />
          </button>
          <input
            type="range"
            min={20}
            max={150}
            value={zoom}
            onChange={(e) => timelineActions.setZoom(Number(e.target.value))}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#f1591f]"
          />
          <button
            type="button"
            onClick={() => timelineActions.setZoom(zoom + 10)}
            className="text-white/50 hover:text-white"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* 2. MULTI-TRACK ROWS BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers (Horizontal Flex Row: Icon + Controls) */}
        <div className="w-28 shrink-0 border-r border-white/[0.08] bg-[#141518] flex flex-col pt-6 z-20">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="h-14 px-2.5 border-b border-white/[0.06] flex flex-row items-center justify-between group/row hover:bg-white/[0.03] relative"
            >
              {/* Left Track Icon with Hover Tooltip */}
              <div className="relative group/trackicon cursor-pointer flex items-center">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                    track.type === "text"
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover/trackicon:border-purple-400"
                      : track.type === "media"
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 group-hover/trackicon:border-orange-400"
                      : track.type === "audio"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover/trackicon:border-emerald-400"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover/trackicon:border-amber-400"
                  }`}
                >
                  {track.type === "text" ? (
                    <Type size={14} />
                  ) : track.type === "media" ? (
                    <Film size={14} />
                  ) : track.type === "audio" ? (
                    <Music size={14} />
                  ) : (
                    <Layers size={14} />
                  )}
                </div>

                {/* Sleek Floating Hover Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1c1d22] border border-white/15 text-white text-[11px] font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover/trackicon:opacity-100 transition-all duration-150 z-50 flex items-center gap-1.5">
                  <span>{track.name}</span>
                  {track.isLocked && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded font-mono">Locked</span>}
                  {!track.isVisible && <span className="text-[9px] text-red-400 bg-red-500/10 px-1 py-0.2 rounded font-mono">Hidden</span>}
                </div>
              </div>

              {/* Right Mini Track Controls (Eye, Lock, Mute) in Flex Row */}
              <div className="flex flex-row items-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => timelineActions.toggleTrackVisibility(track.id)}
                  className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title={track.isVisible ? "Hide Track" : "Show Track"}
                >
                  {track.isVisible ? <Eye size={11} /> : <EyeOff size={11} className="text-red-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => timelineActions.toggleTrackLock(track.id)}
                  className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title={track.isLocked ? "Unlock Track" : "Lock Track"}
                >
                  {track.isLocked ? <Lock size={11} className="text-amber-400" /> : <Unlock size={11} />}
                </button>
                {track.type === "audio" && (
                  <button
                    type="button"
                    onClick={() => timelineActions.toggleTrackMute(track.id)}
                    className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                    title={track.isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {track.isMuted ? <VolumeX size={11} className="text-red-400" /> : <Volume2 size={11} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Scrollable Timeline Canvas */}
        <div
          ref={timelineContainerRef}
          onPointerDown={handleTimelineScrub}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0e0f12] cursor-crosshair"
        >
          <div style={{ width: totalWidthPx }} className="h-full relative flex flex-col">
            {/* Time Ruler Bar */}
            <div className="h-6 border-b border-white/[0.08] relative bg-[#16171a] pointer-events-none">
              {Array.from({ length: Math.ceil(totalDurationInFrames / fps) + 5 }).map((_, sec) => (
                <div
                  key={sec}
                  style={{ left: sec * zoom }}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-0.5 border-l border-white/20 pl-1 text-[9px] font-mono text-white/40"
                >
                  00:{sec.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Draggable Playhead Scrubber */}
            <div
              style={{ left: playheadPositionPx }}
              className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            >
              {/* Playhead Arrow Handle */}
              <div className="w-3 h-3 bg-red-500 transform rotate-45 -translate-x-[5px] -translate-y-1 shadow-md" />
            </div>

            {/* Track Rows with Clips */}
            <div className="flex-1 flex flex-col">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-14 border-b border-white/[0.06] relative flex items-center bg-transparent"
                >
                  {track.clips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipLeftPx = clip.startFrame * pixelsPerFrame;
                    const clipWidthPx = clip.durationInFrames * pixelsPerFrame;

                    const trackColor =
                      track.type === "text"
                        ? "bg-purple-950/70 border-purple-500/50 text-purple-200"
                        : track.type === "media"
                        ? "bg-orange-950/70 border-orange-500/50 text-orange-200"
                        : track.type === "audio"
                        ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                        : "bg-amber-950/70 border-amber-500/50 text-amber-200";

                    return (
                      <div
                        key={clip.id}
                        onPointerDown={(e) => handleStartClipDrag(e, clip)}
                        style={{
                          left: clipLeftPx,
                          width: clipWidthPx,
                        }}
                        className={`absolute h-10 rounded-lg border px-2 flex items-center justify-between text-xs font-semibold cursor-move shadow-md transition-shadow select-none group ${trackColor} ${
                          isSelected ? "ring-2 ring-white border-white" : "hover:border-white/40"
                        }`}
                      >
                        {/* Left Trim Handle */}
                        <div
                          onPointerDown={(e) => handleStartClipTrim(e, clip, "left")}
                          className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/30 rounded-l transition-colors"
                          title="Drag to trim start"
                        />

                        {/* Clip Content Label & Icon */}
                        <div className="flex items-center gap-1.5 truncate px-1">
                          <span className="truncate text-[11px]">{clip.name}</span>
                        </div>

                        {/* Waveform Visualization (for Audio clips) */}
                        {clip.type === "audio" && (
                          <div className="absolute inset-x-3 inset-y-1 opacity-40 flex items-center gap-0.5 pointer-events-none">
                            {Array.from({ length: 30 }).map((_, bi) => (
                              <div
                                key={bi}
                                style={{ height: `${20 + (bi % 5) * 15}%` }}
                                className="w-1 bg-emerald-400 rounded-full"
                              />
                            ))}
                          </div>
                        )}

                        {/* Right Trim Handle */}
                        <div
                          onPointerDown={(e) => handleStartClipTrim(e, clip, "right")}
                          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/30 rounded-r transition-colors"
                          title="Drag to trim end"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
