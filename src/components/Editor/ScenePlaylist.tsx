"use client";

import { useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Film, Type, Mic, Plus, Play, Pause } from "lucide-react";
import type { Scene } from "@/lib/segmentation";
import { withStartFrames } from "@/remotion/Composition";
import { STICKER_ICON_BY_CATEGORY } from "@/components/Video/icons";
import { LAYOUT_THEME } from "@/lib/layoutTheme";

const PX_PER_SECOND = 68;
const MIN_BLOCK_WIDTH = 135;

interface ScenePlaylistProps {
  scenes: Scene[];
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onSelectScene?: (index: number) => void;
  onOpenRecordModal?: (index: number) => void;
}

export function ScenePlaylist({
  scenes,
  playerRef,
  activeSceneIndex = 0,
  onSelectScene,
  onOpenRecordModal,
}: ScenePlaylistProps) {
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  if (scenes.length === 0) {
    return (
      <div className="w-full max-w-4xl rounded-xl border border-border bg-surface p-3 text-xs text-muted">
        Enter a script to generate scenes.
      </div>
    );
  }

  const positioned = withStartFrames(scenes);
  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

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

  return (
    <div className="w-full max-w-4xl rounded-xl border border-border bg-surface p-2.5 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between pb-1.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
            Multi-Track Timeline
          </h2>
          <span className="text-[10px] text-accent font-semibold bg-accent/15 px-2 py-0.2 rounded-full">
            {scenes.length} Scenes • {totalSeconds.toFixed(1)}s Total
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenRecordModal?.(activeSceneIndex)}
          className="flex items-center gap-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm transition cursor-pointer"
        >
          <Mic size={12} />
          <span>Record Voice (#{activeSceneIndex + 1})</span>
        </button>
      </div>

      {/* Multi-Track Container */}
      <div className="flex overflow-hidden rounded-lg border border-border/80 bg-background/50">
        {/* Track Headers (Left Sidebar - Icon Only) */}
        <div className="w-10 shrink-0 border-r border-border/80 bg-surface/90 flex flex-col items-center select-none">
          {/* Time ruler spacer */}
          <div className="h-5 w-full border-b border-border/60 flex items-center justify-center">
            <span className="h-2 w-px bg-border/80" />
          </div>

          {/* 1. Visual Track Header */}
          <div
            className="h-10 w-full border-b border-border/60 flex items-center justify-center text-foreground/80 hover:text-foreground transition cursor-pointer"
            title="Visual Track"
          >
            <Film size={16} />
          </div>

          {/* 2. Text Track Header */}
          <div
            className="h-8 w-full border-b border-border/60 flex items-center justify-center text-foreground/80 hover:text-foreground transition cursor-pointer"
            title="Text Track"
          >
            <Type size={15} />
          </div>

          {/* 3. Voiceover Track Header */}
          <div
            className="h-8 w-full flex items-center justify-center text-foreground/80 hover:text-foreground transition cursor-pointer"
            title="Voiceover Track"
          >
            <Mic size={15} />
          </div>
        </div>

        {/* Tracks Content (Horizontally Scrollable) */}
        <div className="flex-1 overflow-x-auto pb-0.5 scrollbar-thin">
          <div className="flex flex-col min-w-max">
            {/* Time Ruler */}
            <div className="h-5 border-b border-border/60 flex items-center text-[9px] text-muted/60 font-mono px-2">
              {positioned.map(({ scene, from }) => {
                const width = Math.max(MIN_BLOCK_WIDTH, scene.durationSeconds * PX_PER_SECOND);
                const timeSec = (from / 30).toFixed(1);
                return (
                  <div key={scene.id} style={{ width }} className="flex items-center gap-1 border-l border-border/40 pl-1">
                    <span>{timeSec}s</span>
                  </div>
                );
              })}
            </div>

            {/* Row 1: Visuals Track */}
            <div className="h-10 border-b border-border/60 flex gap-1 p-1 items-center">
              {positioned.map(({ scene, from }, index) => {
                const theme = LAYOUT_THEME[scene.layout];
                const width = Math.max(MIN_BLOCK_WIDTH, scene.durationSeconds * PX_PER_SECOND);
                const isSelected = index === activeSceneIndex;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      playerRef.current?.seekTo(from);
                      onSelectScene?.(index);
                    }}
                    style={{ width, minWidth: width }}
                    className={`h-full flex items-center justify-between rounded border px-2 py-0.5 text-left transition cursor-pointer select-none ${
                      isSelected
                        ? "border-accent ring-1 ring-accent bg-accent/20 shadow-sm"
                        : `border-border hover:brightness-110 ${theme?.chipClass || ""}`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] truncate font-sans">
                      <span className="font-bold text-foreground font-mono">#{index + 1}</span>
                      {scene.stickers.slice(0, 1).map((st) => {
                        const Icon = STICKER_ICON_BY_CATEGORY[st.category];
                        return <Icon key={st.category} size={10} />;
                      })}
                      <span className="truncate">{theme?.label || scene.layout}</span>
                    </div>
                    <span className="opacity-80 tabular-nums font-mono text-[9px]">{scene.durationSeconds.toFixed(1)}s</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Text / Captions Track */}
            <div className="h-8 border-b border-border/60 flex gap-1 p-1 items-center">
              {positioned.map(({ scene, from }, index) => {
                const width = Math.max(MIN_BLOCK_WIDTH, scene.durationSeconds * PX_PER_SECOND);
                const isSelected = index === activeSceneIndex;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      playerRef.current?.seekTo(from);
                      onSelectScene?.(index);
                    }}
                    style={{ width, minWidth: width }}
                    className={`h-full flex items-center rounded border px-2 text-left transition cursor-pointer select-none overflow-hidden ${
                      isSelected
                        ? "border-violet-500 bg-violet-500/20 text-foreground"
                        : "border-border/60 bg-surface-raised text-muted hover:text-foreground"
                    }`}
                  >
                    <p className="truncate text-[10px] font-[family-name:var(--font-kantumruy-pro)] leading-tight">
                      {scene.text}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Row 3: Voiceover Audio Track */}
            <div className="h-8 flex gap-1 p-1 items-center">
              {positioned.map(({ scene }, index) => {
                const width = Math.max(MIN_BLOCK_WIDTH, scene.durationSeconds * PX_PER_SECOND);
                const hasAudio = !!scene.audioUrl;
                const isSelected = index === activeSceneIndex;

                if (hasAudio) {
                  return (
                    <div
                      key={scene.id}
                      style={{ width, minWidth: width }}
                      onClick={() => onSelectScene?.(index)}
                      className={`h-full flex items-center justify-between rounded border px-2 transition cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-950/40"
                          : "border-emerald-600/40 bg-emerald-950/25 hover:bg-emerald-950/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => toggleAudioPreview(e, index, scene.audioUrl!)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer shrink-0"
                          title="Listen Voiceover"
                        >
                          {playingAudioIndex === index ? <Pause size={9} /> : <Play size={9} />}
                        </button>
                        <span className="text-[9px] font-mono font-medium text-emerald-300 truncate">
                          🎙️ {scene.audioDurationSeconds || scene.durationSeconds}s
                        </span>
                      </div>

                      {/* Fake audio waveform bars */}
                      <div className="flex items-center gap-0.5 h-3 opacity-80 shrink-0">
                        {[40, 75, 30, 90, 60, 100, 50, 80].map((h, bi) => (
                          <div key={bi} style={{ height: `${h}%` }} className="w-0.5 rounded-full bg-emerald-400" />
                        ))}
                      </div>
                    </div>
                  );
                }

                // If no audio yet recorded for this scene
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => onOpenRecordModal?.(index)}
                    style={{ width, minWidth: width }}
                    className="h-full flex items-center justify-center gap-1 rounded border border-dashed border-border/80 bg-surface/30 px-2 text-muted hover:border-emerald-500 hover:text-emerald-400 transition cursor-pointer text-[9px]"
                    title="Click to record voice for this scene"
                  >
                    <Plus size={10} />
                    <span>Record Voice</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
