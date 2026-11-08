"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { Topbar } from "@/components/Topbar";
import { LeftActivityDock, type NavTab } from "@/components/Editor/LeftActivityDock";
import { InspectorDrawer } from "@/components/Editor/InspectorDrawer";
import { ScenePlaylist } from "@/components/Editor/ScenePlaylist";
import { MultiTrackTimeline } from "@/components/Editor/MultiTrackTimeline";
import { scenesToTracks } from "@/types/timeline";
import { timelineActions } from "@/lib/timelineStore";
import { PlayerDeck } from "@/components/Video/PlayerDeck";
import type { AspectRatio } from "@/components/Video/KineticStage";
import { buildScenes, type Scene } from "@/lib/segmentation";
import { getTotalDurationInFrames, withStartFrames } from "@/remotion/Composition";
import { DEFAULT_PRESET_ID, PRESETS } from "@/lib/presets";
import { DEFAULT_BACKGROUND, type BackgroundConfig } from "@/remotion/backgrounds/types";
import { VoiceoverModal } from "@/components/Audio/VoiceoverModal";
import { AiGeneratorModal, type GeneratedSceneData } from "@/components/Editor/AiGeneratorModal";

const FPS = 30;
const defaultScript = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!.script;

export function Workspace() {
  const [script, setScript] = useState(defaultScript);
  const [sceneDuration, setSceneDuration] = useState(1.8);
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [sceneOverrides, setSceneOverrides] = useState<Record<number, Partial<Scene>>>({});
  
  // Navigation & Drawer
  const [activeTab, setActiveTab] = useState<NavTab>("text");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Modals
  const [recordModalIndex, setRecordModalIndex] = useState<number | null>(null);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);

  // Undo / Redo history
  const [history, setHistory] = useState<Record<number, Partial<Scene>>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<number, Partial<Scene>>[]>([]);

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

  const [timelineMode, setTimelineMode] = useState<"scenes" | "multitrack">("multitrack");

  // Sync scenes into the multi-track timeline store
  useEffect(() => {
    const tracks = scenesToTracks(scenes, FPS);
    timelineActions.setTracks(tracks);
  }, [scenes]);

  const totalDurationInFrames = useMemo(() => getTotalDurationInFrames(scenes), [scenes]);

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

  const handleUpdateScene = useCallback((index: number, updates: Partial<Scene>, recordHistory = true) => {
    setSceneOverrides((prev) => {
      if (recordHistory) {
        setHistory((h) => [...h.slice(-15), prev]);
        setRedoStack([]);
      }
      return {
        ...prev,
        [index]: {
          ...prev[index],
          ...updates,
        },
      };
    });
  }, []);

  const handleUpdatePosition = useCallback(
    (x: number, y: number, isFinal = false) => {
      handleUpdateScene(safeActiveIndex, { positionX: x, positionY: y }, isFinal);
    },
    [handleUpdateScene, safeActiveIndex]
  );

  const handleUpdateSceneText = useCallback(
    (index: number, newText: string) => {
      handleUpdateScene(index, { text: newText });
      setScript((prev) => {
        const lines = prev.split("\n");
        if (lines[index] !== undefined) {
          lines[index] = newText;
          return lines.join("\n");
        }
        return prev;
      });
    },
    [handleUpdateScene]
  );

  const handleApplyToAllScenes = useCallback(
    (updates: Partial<Scene>) => {
      setSceneOverrides((prev) => {
        setHistory((h) => [...h.slice(-15), prev]);
        setRedoStack([]);
        const newOverrides: Record<number, Partial<Scene>> = {};
        baseScenes.forEach((_, idx) => {
          newOverrides[idx] = {
            ...(prev[idx] ?? {}),
            ...updates,
          };
        });
        return newOverrides;
      });
    },
    [baseScenes]
  );

  const handleResetScene = useCallback((index: number) => {
    setSceneOverrides((prev) => {
      setHistory((h) => [...h.slice(-15), prev]);
      setRedoStack([]);
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  }, []);

  // Duplicate active scene
  const handleDuplicateScene = useCallback(
    (index: number) => {
      const lines = script.split("\n").filter((l) => l.trim().length > 0);
      if (index >= 0 && index < lines.length) {
        const lineToDuplicate = lines[index];
        const newLines = [...lines.slice(0, index + 1), lineToDuplicate, ...lines.slice(index + 1)];
        setScript(newLines.join("\n"));
        setActiveSceneIndex(index + 1);
      }
    },
    [script]
  );

  // Delete active scene
  const handleDeleteScene = useCallback(
    (index: number) => {
      const lines = script.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;
      const newLines = lines.filter((_, idx) => idx !== index);
      setScript(newLines.join("\n"));
      setActiveSceneIndex(Math.max(0, index - 1));
    },
    [script]
  );

  // Split active scene in half
  const handleSplitScene = useCallback(
    (index: number) => {
      const lines = script.split("\n").filter((l) => l.trim().length > 0);
      if (index >= 0 && index < lines.length) {
        const targetLine = lines[index];
        const words = targetLine.trim().split(/\s+/);
        if (words.length >= 2) {
          const mid = Math.ceil(words.length / 2);
          const part1 = words.slice(0, mid).join(" ");
          const part2 = words.slice(mid).join(" ");
          const newLines = [
            ...lines.slice(0, index),
            part1,
            part2,
            ...lines.slice(index + 1),
          ];
          setScript(newLines.join("\n"));
          setActiveSceneIndex(index + 1);
        }
      }
    },
    [script]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoStack((r) => [...r, sceneOverrides]);
    setSceneOverrides(prev);
  }, [history, sceneOverrides]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setHistory((h) => [...h, sceneOverrides]);
    setSceneOverrides(next);
  }, [redoStack, sceneOverrides]);

  const handleApplyAiScenes = useCallback(
    (newScript: string, generatedScenes: GeneratedSceneData[]) => {
      setScript(newScript);
      const overrides: Record<number, Partial<Scene>> = {};
      generatedScenes.forEach((s, idx) => {
        overrides[idx] = {
          layout: s.layout,
          nodes: s.nodes,
          durationSeconds: s.durationSeconds ?? 2.0,
          durationInFrames: Math.round((s.durationSeconds ?? 2.0) * 30),
        };
      });
      setSceneOverrides(overrides);
      setActiveSceneIndex(0);
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    },
    []
  );

  const handleOpenRecordModal = useCallback((index: number) => {
    setActiveSceneIndex(index);
    setRecordModalIndex(index);
  }, []);

  const handleSaveAudio = useCallback(
    (index: number, audioDataUrl: string, durationSeconds: number) => {
      setSceneOverrides((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          audioUrl: audioDataUrl,
          audioDurationSeconds: durationSeconds,
          durationSeconds,
          durationInFrames: Math.round(durationSeconds * FPS),
        },
      }));
    },
    []
  );

  const handleRemoveAudio = useCallback((index: number) => {
    setSceneOverrides((prev) => {
      const existing = prev[index];
      if (!existing) return prev;
      const { audioUrl, audioDurationSeconds, ...rest } = existing;
      return { ...prev, [index]: rest };
    });
  }, []);

  const handleUpdateSceneDuration = useCallback(
    (index: number, newDurationSeconds: number) => {
      const clamped = Math.max(0.5, Math.min(30, Math.round(newDurationSeconds * 10) / 10));
      handleUpdateScene(index, {
        durationSeconds: clamped,
        durationInFrames: Math.round(clamped * FPS),
      });
    },
    [handleUpdateScene]
  );

  return (
    <div className="flex h-screen flex-col bg-[#0e0e11] text-foreground overflow-hidden font-sans">
      {/* 1. TOP HEADER (Reference image top bar) */}
      <Topbar
        aspectRatio={aspectRatio}
        onToggleAspectRatio={setAspectRatio}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
      />

      {/* 2. MAIN WORKSPACE BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Activity Dock (~64px icon bar) */}
        <LeftActivityDock
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        />

        {/* Collapsible Secondary Inspector Drawer (~340px) */}
        <InspectorDrawer
          activeTab={activeTab}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          scenes={scenes}
          activeSceneIndex={safeActiveIndex}
          onSelectScene={handleSelectScene}
          onUpdateScene={handleUpdateScene}
          onApplyToAllScenes={handleApplyToAllScenes}
          onResetScene={handleResetScene}
          script={script}
          onScriptChange={setScript}
          sceneDuration={sceneDuration}
          onDurationChange={setSceneDuration}
          onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
          globalBackground={background}
          onUpdateGlobalBackground={setBackground}
          globalBgColor={backgroundColor}
          onUpdateGlobalBgColor={setBackgroundColor}
          onOpenRecordModal={handleOpenRecordModal}
        />

        {/* Studio Center Area (Preview Stage + Bottom Full-Width Multi-Track Timeline) */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#121216]/50">
          {/* Top Preview Stage Area */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
            <PlayerDeck
              scenes={scenes}
              totalDurationInFrames={totalDurationInFrames}
              fps={FPS}
              background={background}
              backgroundColor={backgroundColor}
              playerRef={playerRef}
              activeSceneIndex={safeActiveIndex}
              onUpdatePosition={handleUpdatePosition}
              onUpdateText={handleUpdateSceneText}
              aspectRatio={aspectRatio}
              onSelectScene={handleSelectScene}
            />
          </div>

          {/* Timeline View Mode Bar */}
          <div className="h-8 px-4 bg-[#141518] border-t border-white/[0.08] flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">View Mode:</span>
              <div className="flex items-center bg-[#1c1d22] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setTimelineMode("multitrack")}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                    timelineMode === "multitrack"
                      ? "bg-[#f1591f] text-white shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Multi-Track Pro
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineMode("scenes")}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                    timelineMode === "scenes"
                      ? "bg-[#f1591f] text-white shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Scenes Playlist
                </button>
              </div>
            </div>
            <span className="text-[10px] text-white/40 hidden sm:inline">CapCut / Canva Multi-Track Timeline</span>
          </div>

          {/* Bottom Pro Timeline Dock (Edge-to-Edge) */}
          {timelineMode === "multitrack" ? (
            <MultiTrackTimeline
              playerRef={playerRef}
              totalDurationInFrames={totalDurationInFrames}
              fps={FPS}
            />
          ) : (
            <ScenePlaylist
              scenes={scenes}
              playerRef={playerRef}
              activeSceneIndex={safeActiveIndex}
              onSelectScene={handleSelectScene}
              onOpenRecordModal={handleOpenRecordModal}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={handleDeleteScene}
              onSplitScene={handleSplitScene}
              onUpdateSceneDuration={handleUpdateSceneDuration}
            />
          )}
        </main>
      </div>

      {/* Voiceover Recording Modal */}
      <VoiceoverModal
        isOpen={recordModalIndex !== null}
        scene={recordModalIndex !== null ? scenes[recordModalIndex] : undefined}
        sceneIndex={recordModalIndex ?? 0}
        onClose={() => setRecordModalIndex(null)}
        onSaveAudio={handleSaveAudio}
        onRemoveAudio={handleRemoveAudio}
      />

      {/* AI Explainer Video Generator Modal */}
      <AiGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onApplyScenes={handleApplyAiScenes}
      />
    </div>
  );
}
