"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  X,
  Play,
  RotateCcw,
  Sliders,
  Check,
  CopyCheck,
  ChevronDown,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleDot,
} from "lucide-react";
import type { Scene } from "@/lib/segmentation";
import type {
  AnimationCategory,
  AnimationDirection,
  AnimationEasing,
  TextMotionConfig,
  TextMotionPresetId,
} from "@/remotion/textMotion/types";
import {
  TEXT_MOTION_PRESETS,
  getPresetDef,
  getDefaultMotionConfig,
} from "@/remotion/textMotion/presets";
import { PresetThumbnail } from "@/remotion/textMotion/previewThumbnails";

const CATEGORIES: { id: "all" | AnimationCategory; label: string; count: number }[] = [
  { id: "all", label: "All", count: 50 },
  { id: "entrance", label: "Entrance", count: 10 },
  { id: "exit", label: "Exit", count: 8 },
  { id: "kinetic", label: "Kinetic", count: 8 },
  { id: "cinematic", label: "Cinematic", count: 8 },
  { id: "creative", label: "Creative", count: 8 },
  { id: "loop", label: "Loop", count: 8 },
];

const EASING_OPTIONS: { id: AnimationEasing; label: string }[] = [
  { id: "ease-out", label: "Ease Out" },
  { id: "ease-in", label: "Ease In" },
  { id: "ease-in-out", label: "Ease In Out" },
  { id: "cubic", label: "Cubic" },
  { id: "bounce", label: "Bounce" },
  { id: "linear", label: "Linear" },
];

const DIRECTIONS: { id: AnimationDirection; label: string; icon: typeof ArrowUp }[] = [
  { id: "up", label: "Up", icon: ArrowUp },
  { id: "down", label: "Down", icon: ArrowDown },
  { id: "left", label: "Left", icon: ArrowLeft },
  { id: "right", label: "Right", icon: ArrowRight },
  { id: "center", label: "Center", icon: CircleDot },
];

const EXIT_PRESETS: { id: TextMotionPresetId | "none"; label: string }[] = [
  { id: "none", label: "None (No Exit)" },
  { id: "fade-out", label: "Fade Out" },
  { id: "slide-up-out", label: "Slide Up Out" },
  { id: "slide-down-out", label: "Slide Down Out" },
  { id: "slide-left-out", label: "Slide Left Out" },
  { id: "slide-right-out", label: "Slide Right Out" },
  { id: "zoom-out", label: "Zoom Out" },
  { id: "blur-out", label: "Blur Out" },
  { id: "flip-out", label: "Flip Out" },
];

interface TextAnimationPanelProps {
  scene: Scene;
  sceneIndex: number;
  onUpdateScene: (index: number, updates: Partial<Scene>) => void;
  onApplyToAllScenes: (updates: Partial<Scene>) => void;
}

export function TextAnimationPanel({
  scene,
  sceneIndex,
  onUpdateScene,
  onApplyToAllScenes,
}: TextAnimationPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | AnimationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Active animation config on scene or default to "pop-up"
  const currentConfig: TextMotionConfig = useMemo(() => {
    if (scene.textAnimation) return scene.textAnimation;
    return getDefaultMotionConfig("pop-up");
  }, [scene.textAnimation]);

  const activePreset = useMemo(
    () => getPresetDef(currentConfig.presetId),
    [currentConfig.presetId]
  );

  // Filter presets based on category and search query
  const filteredPresets = useMemo(() => {
    return TEXT_MOTION_PRESETS.filter((preset) => {
      const matchesCategory =
        selectedCategory === "all" || preset.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectPreset = (presetId: TextMotionPresetId) => {
    const defaultCfg = getDefaultMotionConfig(presetId);
    // Preserve any existing exit settings or custom duration if reasonable
    const updated: TextMotionConfig = {
      ...defaultCfg,
      exitPresetId: currentConfig.exitPresetId,
      exitDuration: currentConfig.exitDuration,
    };
    onUpdateScene(sceneIndex, {
      textAnimation: updated,
    });
  };

  const handleUpdateConfig = (patch: Partial<TextMotionConfig>) => {
    const updated: TextMotionConfig = {
      ...currentConfig,
      ...patch,
    };
    onUpdateScene(sceneIndex, {
      textAnimation: updated,
    });
  };

  const handleApplyAll = () => {
    onApplyToAllScenes({ textAnimation: currentConfig });
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const isLoopCategory = activePreset.category === "loop" || currentConfig.loop;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface-raised/40 p-2.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
            50 Motion Presets
          </span>
        </div>
        <span className="text-[10px] font-semibold text-accent font-mono bg-accent/15 px-1.5 py-0.5 rounded-full">
          {activePreset.name}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search size={12} className="absolute left-2.5 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search 50 text animations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-7 py-1 text-xs text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 text-muted hover:text-foreground cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface-raised/80 text-muted hover:text-foreground hover:bg-surface-raised"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[9px] px-1 rounded-full ${isActive ? "bg-white/20" : "bg-white/5"}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 50 Presets Grid (with Live Animated Thumbnails) */}
      <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
        {filteredPresets.map((preset) => {
          const isSelected = currentConfig.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`group flex flex-col items-center cursor-pointer select-none transition text-left rounded-lg p-1 border ${
                isSelected
                  ? "border-accent ring-2 ring-accent/60 bg-accent/15"
                  : "border-border/80 bg-surface-raised hover:border-accent/50 hover:bg-surface-raised/90"
              }`}
              title={`${preset.name}: ${preset.description}`}
            >
              <PresetThumbnail preset={preset} isSelected={isSelected} />
              <div className="w-full mt-1 flex items-center justify-between px-0.5">
                <span
                  className={`text-[10px] truncate leading-tight ${
                    isSelected ? "text-accent font-bold" : "text-foreground/80 font-medium group-hover:text-foreground"
                  }`}
                >
                  {preset.name}
                </span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0 ml-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* EDITABLE ANIMATION PROPERTIES PANEL                      */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders size={12} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
              {activePreset.name} Settings
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPreset(activePreset.id)}
            className="text-[9px] text-muted hover:text-accent flex items-center gap-0.5 cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw size={9} />
            <span>Reset</span>
          </button>
        </div>

        {/* 1. Duration & Delay Controls */}
        <div className="grid grid-cols-2 gap-2">
          {/* Duration */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-muted font-medium">
              <span>Duration</span>
              <span className="font-mono text-foreground font-semibold">
                {currentConfig.duration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={currentConfig.duration}
              onChange={(e) => handleUpdateConfig({ duration: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Delay */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-muted font-medium">
              <span>Delay</span>
              <span className="font-mono text-foreground font-semibold">
                {currentConfig.delay.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={currentConfig.delay}
              onChange={(e) => handleUpdateConfig({ delay: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>

        {/* 2. Speed & Intensity Controls */}
        <div className="grid grid-cols-2 gap-2">
          {/* Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-muted font-medium">
              <span>Speed</span>
              <span className="font-mono text-foreground font-semibold">
                {currentConfig.speed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={currentConfig.speed}
              onChange={(e) => handleUpdateConfig({ speed: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Intensity */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-muted font-medium">
              <span>Intensity</span>
              <span className="font-mono text-foreground font-semibold">
                {currentConfig.intensity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={currentConfig.intensity}
              onChange={(e) => handleUpdateConfig({ intensity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>

        {/* 3. Direction Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted font-medium">Direction</span>
          <div className="grid grid-cols-5 gap-1">
            {DIRECTIONS.map((dir) => {
              const isSelected = currentConfig.direction === dir.id;
              const Icon = dir.icon;
              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => handleUpdateConfig({ direction: dir.id })}
                  className={`flex flex-col items-center justify-center py-1 rounded border transition cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/20 text-accent font-bold"
                      : "border-border/60 bg-surface-raised text-muted hover:text-foreground"
                  }`}
                  title={dir.label}
                >
                  <Icon size={11} />
                  <span className="text-[8px] mt-0.5">{dir.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Easing Function */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted font-medium">Easing Curve</span>
          <div className="grid grid-cols-3 gap-1">
            {EASING_OPTIONS.map((ease) => {
              const isSelected = currentConfig.easing === ease.id;
              return (
                <button
                  key={ease.id}
                  type="button"
                  onClick={() => handleUpdateConfig({ easing: ease.id })}
                  className={`px-1.5 py-0.5 rounded text-[9px] border font-medium transition cursor-pointer text-center ${
                    isSelected
                      ? "border-accent bg-accent text-white font-bold"
                      : "border-border/60 bg-surface-raised text-muted hover:text-foreground"
                  }`}
                >
                  {ease.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Continuous Motion Controls (Loop, Amplitude, Frequency) */}
        {isLoopCategory && (
          <div className="flex flex-col gap-2 p-2 rounded-lg border border-accent/30 bg-accent/5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-accent">Loop Settings</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[9px] text-muted">Continuous</span>
                <input
                  type="checkbox"
                  checked={currentConfig.loop}
                  onChange={(e) => handleUpdateConfig({ loop: e.target.checked })}
                  className="rounded border-border accent-accent cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] text-muted">
                  <span>Amplitude</span>
                  <span className="font-mono text-foreground">{currentConfig.amplitude}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={currentConfig.amplitude}
                  onChange={(e) => handleUpdateConfig({ amplitude: parseInt(e.target.value) })}
                  className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] text-muted">
                  <span>Frequency</span>
                  <span className="font-mono text-foreground">{currentConfig.frequency.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={currentConfig.frequency}
                  onChange={(e) => handleUpdateConfig({ frequency: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-surface-raised rounded appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Exit Animation Combination */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-[#94a3b8]">Exit Animation (Optional)</span>
            {currentConfig.exitPresetId && currentConfig.exitPresetId !== ("none" as any) && (
              <span className="font-mono text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.2 rounded-md">
                {currentConfig.exitDuration?.toFixed(1)}s
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={currentConfig.exitPresetId ?? "none"}
              onChange={(e) =>
                handleUpdateConfig({
                  exitPresetId:
                    e.target.value === "none"
                      ? undefined
                      : (e.target.value as TextMotionPresetId),
                })
              }
              className="h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] text-[13px] text-white font-medium pl-3 pr-8 appearance-none cursor-pointer transition-colors hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 focus:border-[#f1591f]/60"
            >
              {EXIT_PRESETS.map((exit) => (
                <option key={exit.id} value={exit.id} className="bg-[#1c1d22] text-white">
                  {exit.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
          </div>
        </div>

        {/* Apply Animation to All Scenes Button */}
        <button
          type="button"
          onClick={handleApplyAll}
          className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-raised py-1.5 px-2 text-[10px] font-semibold text-foreground transition hover:border-accent hover:text-accent cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">Applied to All Scenes!</span>
            </>
          ) : (
            <>
              <CopyCheck size={11} />
              <span>Apply Animation to All Scenes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
