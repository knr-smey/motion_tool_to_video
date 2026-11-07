"use client";

import type { RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import type { Scene } from "@/lib/segmentation";
import { withStartFrames } from "@/remotion/Composition";
import { STICKER_ICON_BY_CATEGORY } from "@/components/Video/icons";
import { LAYOUT_THEME } from "@/lib/layoutTheme";

const PX_PER_SECOND = 56;
const MIN_BLOCK_WIDTH = 120;

interface ScenePlaylistProps {
  scenes: Scene[];
  playerRef: RefObject<PlayerRef | null>;
}

export function ScenePlaylist({ scenes, playerRef }: ScenePlaylistProps) {
  if (scenes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Enter a script to generate scenes.
      </div>
    );
  }

  const positioned = withStartFrames(scenes);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <span className="text-xs text-muted">{scenes.length} scenes</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {positioned.map(({ scene, from }, index) => {
          const theme = LAYOUT_THEME[scene.layout];
          const width = Math.max(MIN_BLOCK_WIDTH, scene.durationSeconds * PX_PER_SECOND);

          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => playerRef.current?.seekTo(from)}
              style={{ width, minWidth: width }}
              className={`flex flex-shrink-0 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors hover:brightness-110 ${theme.chipClass}`}
            >
              <div className="flex w-full items-center justify-between text-xs opacity-80">
                <span>#{index + 1}</span>
                <span className="tabular-nums">{scene.durationSeconds.toFixed(1)}s</span>
              </div>
              <p className="line-clamp-2 text-xs leading-snug text-foreground">{scene.text}</p>
              <div className="flex items-center gap-1 text-xs opacity-80">
                {scene.stickers.map((sticker) => {
                  const Icon = STICKER_ICON_BY_CATEGORY[sticker.category];
                  return <Icon key={sticker.category} size={12} />;
                })}
                <span>{theme.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
