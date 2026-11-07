"use client";

import { useMemo, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { Topbar } from "@/components/Topbar";
import { ScriptInput } from "@/components/Editor/ScriptInput";
import { BackgroundPicker } from "@/components/Editor/BackgroundPicker";
import { ScenePlaylist } from "@/components/Editor/ScenePlaylist";
import { PlayerDeck } from "@/components/Video/PlayerDeck";
import { buildScenes } from "@/lib/segmentation";
import { getTotalDurationInFrames } from "@/remotion/Composition";
import { DEFAULT_PRESET_ID, PRESETS } from "@/lib/presets";
import { DEFAULT_BACKGROUND, type BackgroundConfig } from "@/remotion/backgrounds/types";

const FPS = 30;
const defaultScript = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!.script;

export function Workspace() {
  const [script, setScript] = useState(defaultScript);
  const [wpm, setWpm] = useState(145);
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const playerRef = useRef<PlayerRef>(null);

  const scenes = useMemo(() => buildScenes(script, { wpm, fps: FPS }), [script, wpm]);
  const totalDurationInFrames = useMemo(() => getTotalDurationInFrames(scenes), [scenes]);
  const wordCount = useMemo(
    () => scenes.reduce((total, scene) => total + scene.wordCount, 0),
    [scenes]
  );

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] shrink-0 overflow-y-auto border-r border-border p-4 flex flex-col gap-4">
          <ScriptInput
            script={script}
            wordCount={wordCount}
            wpm={wpm}
            onScriptChange={setScript}
            onWpmChange={setWpm}
          />
          <BackgroundPicker value={background} onChange={setBackground} />
        </aside>

        <main className="flex flex-1 items-center justify-center overflow-auto p-8">
          <PlayerDeck
            scenes={scenes}
            totalDurationInFrames={totalDurationInFrames}
            fps={FPS}
            background={background}
            playerRef={playerRef}
          />
        </main>
      </div>

      <footer className="shrink-0 border-t border-border p-4">
        <ScenePlaylist scenes={scenes} playerRef={playerRef} />
      </footer>
    </div>
  );
}
