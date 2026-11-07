"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { Topbar } from "@/components/Topbar";
import { ScriptPanel } from "@/components/Editor/ScriptPanel";
import { EditPanel } from "@/components/Editor/EditPanel";
import { ScenePlaylist } from "@/components/Editor/ScenePlaylist";
import { PlayerDeck } from "@/components/Video/PlayerDeck";
import { buildScenes, type Scene } from "@/lib/segmentation";
import { getTotalDurationInFrames, withStartFrames } from "@/remotion/Composition";
import { DEFAULT_PRESET_ID, PRESETS } from "@/lib/presets";
import { DEFAULT_BACKGROUND, type BackgroundConfig } from "@/remotion/backgrounds/types";

const FPS = 30;
const defaultScript = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!.script;

export function Workspace() {
  const [script, setScript] = useState(defaultScript);
  const [sceneDuration, setSceneDuration] = useState(1.8);
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [sceneOverrides, setSceneOverrides] = useState<Record<number, Partial<Scene>>>({});

  const playerRef = useRef<PlayerRef>(null);

  // Generate base scenes segmented from script text
  const baseScenes = useMemo(
    () => buildScenes(script, { durationSeconds: sceneDuration, fps: FPS }),
    [script, sceneDuration]
  );

  // Merge base scenes with any scene-specific customizations
  const scenes = useMemo(() => {
    return baseScenes.map((baseScene, index) => {
      const override = sceneOverrides[index];
      if (!override) return baseScene;
      return { ...baseScene, ...override };
    });
  }, [baseScenes, sceneOverrides]);

  const totalDurationInFrames = useMemo(() => getTotalDurationInFrames(scenes), [scenes]);
  const wordCount = useMemo(
    () => scenes.reduce((total, scene) => total + scene.wordCount, 0),
    [scenes]
  );

  // Safe active scene index clamping
  const safeActiveIndex = Math.min(
    Math.max(0, activeSceneIndex),
    Math.max(0, scenes.length - 1)
  );

  const handleSelectScene = useCallback(
    (index: number) => {
      setActiveSceneIndex(index);
      const positioned = withStartFrames(scenes);
      const target = positioned[index];
      if (target && playerRef.current) {
        playerRef.current.seekTo(target.from);
      }
    },
    [scenes]
  );

  const handleUpdateScene = useCallback((index: number, updates: Partial<Scene>) => {
    setSceneOverrides((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        ...updates,
      },
    }));
  }, []);

  const handleUpdatePosition = useCallback(
    (x: number, y: number) => {
      handleUpdateScene(safeActiveIndex, { positionX: x, positionY: y });
    },
    [handleUpdateScene, safeActiveIndex]
  );

  const handleApplyToAllScenes = useCallback(
    (templateScene: Scene) => {
      const newOverrides: Record<number, Partial<Scene>> = {};
      baseScenes.forEach((_, idx) => {
        newOverrides[idx] = {
          layout: templateScene.layout,
          backgroundColor: templateScene.backgroundColor,
          textColor: templateScene.textColor,
          lineHeight: templateScene.lineHeight,
          fontSize: templateScene.fontSize,
          positionX: templateScene.positionX,
          positionY: templateScene.positionY,
          textAlign: templateScene.textAlign,
          background: templateScene.background,
        };
      });
      setSceneOverrides(newOverrides);
    },
    [baseScenes]
  );

  const handleResetScene = useCallback((index: number) => {
    setSceneOverrides((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Script Panel */}
        <aside className="w-[360px] xl:w-[400px] shrink-0 overflow-y-auto border-r border-border bg-surface/30">
          <ScriptPanel
            script={script}
            wordCount={wordCount}
            duration={sceneDuration}
            scenes={scenes}
            activeSceneIndex={safeActiveIndex}
            onScriptChange={setScript}
            onDurationChange={setSceneDuration}
            onSelectScene={handleSelectScene}
          />
        </aside>

        {/* CENTER PANEL: Stage Deck & Timeline */}
        <main className="flex flex-1 flex-col overflow-y-auto p-4 xl:p-6 gap-4 items-center justify-start bg-background/60">
          <PlayerDeck
            scenes={scenes}
            totalDurationInFrames={totalDurationInFrames}
            fps={FPS}
            background={background}
            playerRef={playerRef}
            activeSceneIndex={safeActiveIndex}
            onUpdatePosition={handleUpdatePosition}
          />

          <ScenePlaylist
            scenes={scenes}
            playerRef={playerRef}
            activeSceneIndex={safeActiveIndex}
            onSelectScene={handleSelectScene}
          />
        </main>

        {/* RIGHT PANEL: Edit Panel */}
        <aside className="w-[380px] xl:w-[420px] shrink-0 overflow-y-auto border-l border-border bg-surface/30">
          <EditPanel
            scenes={scenes}
            activeSceneIndex={safeActiveIndex}
            onSelectScene={handleSelectScene}
            onUpdateScene={handleUpdateScene}
            onApplyToAllScenes={handleApplyToAllScenes}
            onResetScene={handleResetScene}
          />
        </aside>
      </div>
    </div>
  );
}
