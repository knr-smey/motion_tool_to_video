"use client";

import { useMemo, useState } from "react";
import { ScriptInput } from "@/components/Editor/ScriptInput";
import { ScenePlaylist } from "@/components/Editor/ScenePlaylist";
import { PlayerDeck } from "@/components/Video/PlayerDeck";
import { buildScenes } from "@/lib/segmentation";
import { getTotalDurationInFrames } from "@/remotion/Composition";
import { DEFAULT_PRESET_ID, PRESETS } from "@/lib/presets";

const FPS = 30;
const defaultScript = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!.script;

export default function Home() {
  const [script, setScript] = useState(defaultScript);
  const [wpm, setWpm] = useState(145);

  const scenes = useMemo(() => buildScenes(script, { wpm, fps: FPS }), [script, wpm]);
  const totalDurationInFrames = useMemo(() => getTotalDurationInFrames(scenes), [scenes]);
  const wordCount = useMemo(
    () => scenes.reduce((total, scene) => total + scene.wordCount, 0),
    [scenes]
  );

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-[family-name:var(--font-moul)]">KineticCast Khmer</h1>
        <p className="text-neutral-600 mt-1">
          Script-to-kinetic-typography video engine for Khmer.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="flex flex-col gap-6">
          <ScriptInput
            script={script}
            wordCount={wordCount}
            wpm={wpm}
            onScriptChange={setScript}
            onWpmChange={setWpm}
          />
          <ScenePlaylist scenes={scenes} />
        </section>

        <section>
          <PlayerDeck scenes={scenes} totalDurationInFrames={totalDurationInFrames} />
        </section>
      </div>
    </main>
  );
}
