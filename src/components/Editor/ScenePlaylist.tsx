"use client";

import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import type { Scene } from "@/lib/segmentation";
import { withStartFrames } from "@/remotion/Composition";
import { STICKER_ICON_BY_CATEGORY } from "@/components/Video/icons";
import { LAYOUT_THEME } from "@/lib/layoutTheme";

const PX_PER_SECOND = 64;
const MIN_BLOCK_WIDTH = 130;

interface ScenePlaylistProps {
  scenes: Scene[];
  playerRef: RefObject<PlayerRef | null>;
  activeSceneIndex?: number;
  onSelectScene?: (index: number) => void;
}

export function ScenePlaylist({
  scenes,
  playerRef,
  activeSceneIndex = 0,
  onSelectScene,
}: ScenePlaylistProps) {
  if (scenes.length === 0) {
    return (
      <div className="w-full max-w-4xl rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Enter a script to generate scenes.
      </div>
    );
  }

  const positioned = withStartFrames(scenes);

  return (
    <div className="w-full max-w-4xl rounded-xl border border-border bg-surface p-3.5 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Timeline Sequence
          </h2>
          <span className="text-[10px] text-accent font-medium bg-accent/15 px-2 py-0.5 rounded-full">
            {scenes.length} Scenes
          </span>
        </div>
        <span className="text-xs text-muted">Click any scene block to jump & inspect</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
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
              className={`flex flex-shrink-0 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-all ${
                isSelected
                  ? "border-accent ring-2 ring-accent/60 bg-accent/20 scale-[1.02] shadow-md z-10"
                  : `hover:brightness-110 ${theme.chipClass}`
              }`}
            >
              <div className="flex w-full items-center justify-between text-[11px] opacity-80">
                <span className="font-semibold text-foreground">#{index + 1}</span>
                <span className="tabular-nums font-mono">{scene.durationSeconds.toFixed(1)}s</span>
              </div>
              <p className="line-clamp-2 text-xs leading-snug font-[family-name:var(--font-kantumruy-pro)] text-foreground">
                {scene.text}
              </p>
              <div className="mt-auto flex w-full items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1">
                  {scene.stickers.map((sticker) => {
                    const Icon = STICKER_ICON_BY_CATEGORY[sticker.category];
                    return <Icon key={sticker.category} size={11} />;
                  })}
                  <span className="truncate">{theme.label}</span>
                </div>
                {scene.positionX !== 0 || scene.positionY !== 0 ? (
                  <span className="text-accent text-[9px]">📍</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
