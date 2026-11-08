"use client";

import { useState, useRef } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Underline,
  Italic,
  CaseUpper,
  Upload,
  X,
  Plus,
  Minus,
  Sparkles,
  Palette,
  Mic,
  RotateCcw,
  Check,
  CopyCheck,
  ChevronDown,
} from "lucide-react";
import type { Scene, SceneLayout } from "@/lib/segmentation";
import type { BackgroundConfig, BackgroundStyle } from "@/remotion/backgrounds/types";
import { PRESETS } from "@/lib/presets";
import type { NavTab } from "./LeftActivityDock";
import { TextAnimationPanel } from "./TextAnimationPanel";
import { UploadsPanel } from "./UploadsPanel";

interface InspectorDrawerProps {
  activeTab: NavTab;
  isOpen: boolean;
  onClose: () => void;
  // Scene props
  scenes: Scene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (index: number, updates: Partial<Scene>) => void;
  onApplyToAllScenes: (updates: Partial<Scene>) => void;
  onResetScene: (index: number) => void;
  // Script props
  script: string;
  onScriptChange: (script: string) => void;
  sceneDuration: number;
  onDurationChange: (duration: number) => void;
  onOpenAiGenerator: () => void;
  // Background props
  globalBackground?: BackgroundConfig;
  onUpdateGlobalBackground?: (bg: BackgroundConfig) => void;
  globalBgColor?: string;
  onUpdateGlobalBgColor?: (color: string) => void;
  // Voiceover
  onOpenRecordModal?: (index: number) => void;
}

const BG_COLOR_SWATCHES = [
  { label: "Pitch Black", color: "#000000" },
  { label: "Deep Night", color: "#0B0F19" },
  { label: "Zinc Dark", color: "#18181B" },
  { label: "Pure White", color: "#FFFFFF" },
  { label: "Midnight Blue", color: "#0F172A" },
  { label: "Cyber Violet", color: "#1E1B4B" },
  { label: "Crimson Noir", color: "#2A0A10" },
  { label: "Forest Dark", color: "#062016" },
];

const BG_STYLE_OPTIONS: { id: BackgroundStyle; label: string }[] = [
  { id: "none", label: "Solid" },
  { id: "grid", label: "Grid" },
  { id: "galaxy", label: "Galaxy" },
  { id: "image", label: "Image" },
];

export function InspectorDrawer({
  activeTab,
  isOpen,
  onClose,
  scenes,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onApplyToAllScenes,
  onResetScene,
  script,
  onScriptChange,
  sceneDuration,
  onDurationChange,
  onOpenAiGenerator,
  globalBackground,
  onUpdateGlobalBackground,
  globalBgColor,
  onUpdateGlobalBgColor,
  onOpenRecordModal,
}: InspectorDrawerProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scene = scenes[activeSceneIndex];
  const activeLayout = scene?.layout ?? "center-impact";
  const activeBgColor = globalBgColor ?? scene?.backgroundColor ?? "#000000";
  const activeTextColor = scene?.textColor ?? "#FFFFFF";
  const activeLineHeight = scene?.lineHeight ?? 1.35;
  const activeFontSize = scene?.fontSize ?? 76;
  const activePosX = scene?.positionX ?? 0;
  const activePosY = scene?.positionY ?? 0;
  const activeAlign = scene?.textAlign ?? "center";
  const activeFontFamily = scene?.fontFamily ?? "Moul";
  const activeBackground = globalBackground ?? scene?.background ?? { style: "none", imageDataUrl: null };

  const handleApplyPartialToAll = (sectionKey: string, updates: Partial<Scene>) => {
    onApplyToAllScenes(updates);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSelectBackgroundEffect = (style: BackgroundStyle) => {
    const updatedBg: BackgroundConfig = {
      style,
      imageDataUrl: activeBackground.imageDataUrl,
    };
    onUpdateGlobalBackground?.(updatedBg);
    onApplyToAllScenes({ background: updatedBg });
  };

  const handleSelectBgColor = (color: string) => {
    onUpdateGlobalBgColor?.(color);
    onApplyToAllScenes({ backgroundColor: color });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updatedBg: BackgroundConfig = { style: "image", imageDataUrl: dataUrl };
      onUpdateGlobalBackground?.(updatedBg);
      onApplyToAllScenes({ background: updatedBg });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[310px] xl:w-[340px] shrink-0 border-r border-border/80 bg-[#141418] flex flex-col h-full overflow-hidden select-none z-10">
      {/* Panel Top Header with Title & Collapse << */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 px-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground capitalize">
          {activeTab === "text" && "Text"}
          {activeTab === "script" && "Script & Scenes"}
          {activeTab === "canvas" && "Canvas Background"}
          {activeTab === "audio" && "Audio & Voiceover"}
          {activeTab === "uploads" && "Media Uploads"}
          {activeTab === "subtitles" && "Subtitles"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised transition cursor-pointer"
          title="Collapse panel"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* Scrollable Panel Body */}
      <div
        key={activeTab}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 mac-scrollbar text-xs transition-opacity duration-150"
      >
        {/* ============================================================== */}
        {/* TAB 1: TEXT INSPECTOR (Matching reference screenshot)         */}
        {/* ============================================================== */}
        {activeTab === "text" && (
          <>
            {/* Align section (6 icon alignment buttons) */}
            <div>
              <div className="text-[11px] font-medium text-muted mb-1.5">Align</div>
              <div className="grid grid-cols-6 gap-1 rounded-lg border border-border/80 bg-surface-raised/60 p-1">
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "left", positionX: -180 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Left"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "center", positionX: 0 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Center"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "right", positionX: 180 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Right"
                >
                  <AlignRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { positionY: -140 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Top"
                >
                  <AlignVerticalJustifyStart size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { positionY: 0 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Middle"
                >
                  <AlignVerticalJustifyCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { positionY: 140 })}
                  className="flex h-6 items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
                  title="Align Bottom"
                >
                  <AlignVerticalJustifyEnd size={13} />
                </button>
              </div>
            </div>

            {/* Position inputs: X, Y, Rotate */}
            <div>
              <div className="text-[11px] font-medium text-muted mb-1.5">Position</div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="flex items-center rounded-lg border border-border/80 bg-surface-raised/80 px-2 py-1">
                  <span className="text-[10px] text-muted mr-1">X</span>
                  <input
                    type="number"
                    value={activePosX}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { positionX: Number(e.target.value) })}
                    className="w-full bg-transparent font-mono text-[11px] text-foreground focus:outline-none"
                  />
                </div>
                <div className="flex items-center rounded-lg border border-border/80 bg-surface-raised/80 px-2 py-1">
                  <span className="text-[10px] text-muted mr-1">Y</span>
                  <input
                    type="number"
                    value={activePosY}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { positionY: Number(e.target.value) })}
                    className="w-full bg-transparent font-mono text-[11px] text-foreground focus:outline-none"
                  />
                </div>
                <div className="flex items-center rounded-lg border border-border/80 bg-surface-raised/80 px-2 py-1">
                  <span className="text-[10px] text-muted mr-1">∠</span>
                  <input aria-label="Rotation" type="number" value={scene?.rotation ?? 0} onChange={(e) => onUpdateScene(activeSceneIndex, { rotation: Number(e.target.value) })} className="w-full bg-transparent font-mono text-[11px] text-foreground focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Size inputs: Font Size [+] [-] & Line-Height */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted mb-1.5">
                <span>Font Size & Spacing</span>
                <span className="font-mono text-accent tabular-nums">{activeFontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-between rounded-lg border border-border/80 bg-surface-raised/80 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onUpdateScene(activeSceneIndex, { fontSize: Math.max(32, activeFontSize - 4) })}
                    className="text-muted hover:text-foreground cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono font-bold text-foreground text-xs">{activeFontSize}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateScene(activeSceneIndex, { fontSize: Math.min(140, activeFontSize + 4) })}
                    className="text-muted hover:text-foreground cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-between rounded-lg border border-border/80 bg-surface-raised/80 px-2 py-1 text-[11px]">
                  <span className="text-muted">Line</span>
                  <input aria-label="Line height" type="number" step="0.05" value={activeLineHeight} onChange={(e) => onUpdateScene(activeSceneIndex, { lineHeight: Number(e.target.value) })} className="w-12 bg-transparent text-right font-mono font-semibold text-foreground" />
                </div>
              </div>
            </div>

            {/* Scene Text Input */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted mb-1.5">
                <span>Scene #{activeSceneIndex + 1} Text</span>
                <span className="text-[10px] text-accent font-semibold">1 Line = 1 Scene</span>
              </div>
              <textarea
                value={scene?.text ?? ""}
                onChange={(e) => onUpdateScene(activeSceneIndex, { text: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg border border-border/80 bg-surface-raised/90 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none font-[family-name:var(--font-kantumruy-pro)]"
                placeholder="Type narration or scene text..."
              />
            </div>

            {/* Text Formatting Toolbar (Underline, Italic, All Caps, Alignment) */}
            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-surface-raised/60 p-1">
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "left" })}
                className={`flex-1 flex items-center justify-center py-1 rounded transition cursor-pointer ${activeAlign === "left" ? "bg-accent/20 text-accent font-bold" : "text-muted hover:text-foreground"}`}
                title="Left Align"
              >
                <AlignLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "center" })}
                className={`flex-1 flex items-center justify-center py-1 rounded transition cursor-pointer ${activeAlign === "center" ? "bg-accent/20 text-accent font-bold" : "text-muted hover:text-foreground"}`}
                title="Center Align"
              >
                <AlignCenter size={13} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { textAlign: "right" })}
                className={`flex-1 flex items-center justify-center py-1 rounded transition cursor-pointer ${activeAlign === "right" ? "bg-accent/20 text-accent font-bold" : "text-muted hover:text-foreground"}`}
                title="Right Align"
              >
                <AlignRight size={13} />
              </button>
              <div className="h-3.5 w-px bg-border/60 mx-0.5" />
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { underline: !scene?.underline })}
                aria-pressed={!!scene?.underline}
                className={`flex-1 flex items-center justify-center py-1 rounded cursor-pointer ${scene?.underline ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"}`}
                title="Underline"
              >
                <Underline size={13} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { italic: !scene?.italic })}
                aria-pressed={!!scene?.italic}
                className={`flex-1 flex items-center justify-center py-1 rounded cursor-pointer ${scene?.italic ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"}`}
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { bold: !scene?.bold })}
                aria-pressed={!!scene?.bold}
                className={`flex-1 flex items-center justify-center py-1 rounded cursor-pointer ${scene?.bold ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"}`}
                title="Uppercase"
              >
                <CaseUpper size={14} />
              </button>
            </div>

            {/* Sleek Modern Dark Typography Settings Card (Figma/Linear Style) */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#16171b] p-4 shadow-xl shadow-black/40">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Row 1: Font Family */}
                <div>
                  <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">
                    Font family
                  </label>
                  <div className="relative">
                    <select
                      value={activeFontFamily}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { fontFamily: e.target.value })}
                      className="h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] text-[13px] text-white font-medium pl-3 pr-8 appearance-none cursor-pointer transition-colors hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 focus:border-[#f1591f]/60"
                    >
                      {["Moul", "Poppins", "Battambang", "Kantumruy Pro"].map((font) => (
                        <option key={font} value={font} className="bg-[#1c1d22] text-white">
                          {font}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                  </div>
                </div>

                {/* Row 1: Weight */}
                <div>
                  <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">
                    Weight
                  </label>
                  <div className="relative">
                    <select
                      value={scene?.fontWeight ?? 700}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { fontWeight: Number(e.target.value) })}
                      className="h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] text-[13px] text-white font-medium pl-3 pr-8 appearance-none cursor-pointer transition-colors hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 focus:border-[#f1591f]/60"
                    >
                      {[400, 600, 700, 800].map((weight) => (
                        <option key={weight} value={weight} className="bg-[#1c1d22] text-white">
                          {weight}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                  </div>
                </div>

                {/* Row 2: Text Background Color Swatch */}
                <div>
                  <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">
                    Text background
                  </label>
                  <label className="relative h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] px-2.5 flex items-center justify-between transition-colors hover:border-white/20 focus-within:ring-2 focus-within:ring-[#f1591f]/30 focus-within:border-[#f1591f]/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-md border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: scene?.textBackgroundColor ?? "#000000" }}
                      />
                      <span className="font-mono text-[12px] text-white/90 uppercase font-medium">
                        {scene?.textBackgroundColor ?? "#000000"}
                      </span>
                    </div>
                    <input
                      type="color"
                      value={scene?.textBackgroundColor ?? "#000000"}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { textBackgroundColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>

                {/* Row 2: Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-[#94a3b8]">Opacity</span>
                    <span className="text-[11px] font-mono font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.2 rounded-md">
                      {Math.round((scene?.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <div className="h-[38px] rounded-lg bg-[#1c1d22] border border-white/[0.08] px-3 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={scene?.opacity ?? 1}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { opacity: Number(e.target.value) })}
                      className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-[#f1591f] hover:accent-orange-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Letter Spacing */}
                <div>
                  <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">
                    Letter spacing
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.5"
                      value={scene?.letterSpacing ?? 0}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { letterSpacing: Number(e.target.value) })}
                      className="h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] text-[13px] text-white font-medium pl-3 pr-8 transition-colors hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 focus:border-[#f1591f]/60"
                    />
                    <span className="absolute right-3 text-[11px] font-mono text-white/40 pointer-events-none select-none">
                      px
                    </span>
                  </div>
                </div>

                {/* Row 3: Text Outline */}
                <div>
                  <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">
                    Text outline
                  </label>
                  <input
                    type="text"
                    placeholder="2px #000000"
                    value={scene?.textStroke ?? ""}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { textStroke: e.target.value || undefined })}
                    className="h-[38px] w-full rounded-lg bg-[#1c1d22] border border-white/[0.08] text-[13px] text-white font-medium px-3 placeholder:text-white/25 transition-colors hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 focus:border-[#f1591f]/60"
                  />
                </div>

                {/* Row 4: Shadow Toggle */}
                <div className="col-span-2 flex items-center justify-between rounded-xl bg-[#1c1d22]/60 border border-white/[0.06] px-3.5 py-2.5 transition-colors hover:border-white/[0.12]">
                  <div>
                    <span className="block text-[12px] font-medium text-white/90">Shadow</span>
                    <span className="block text-[10px] text-white/40">Soft drop shadow effect</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!scene?.textShadow}
                    onClick={() => onUpdateScene(activeSceneIndex, { textShadow: !scene?.textShadow })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#f1591f]/30 ${
                      scene?.textShadow ? "bg-[#f1591f]" : "bg-white/15"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        scene?.textShadow ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Professional 50 Text Motion Animation System */}
            {scene && (
              <TextAnimationPanel
                scene={scene}
                sceneIndex={activeSceneIndex}
                onUpdateScene={onUpdateScene}
                onApplyToAllScenes={onApplyToAllScenes}
              />
            )}

            {/* Fill / Text Color Picker with Hex Code & Opacity */}
            <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted">
                <span>Color / Fill</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-muted uppercase text-[10px]">{activeTextColor}</span>
                  <input
                    type="color"
                    value={activeTextColor}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { textColor: e.target.value })}
                    className="h-5 w-6 cursor-pointer rounded border border-border bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-surface-raised px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-border shadow-inner" style={{ backgroundColor: activeTextColor }} />
                  <span className="font-mono text-xs font-semibold text-foreground">{activeTextColor.toUpperCase()}</span>
                </div>
                <span className="font-mono text-[11px] text-muted">100%</span>
              </div>

              <button
                type="button"
                onClick={() => handleApplyPartialToAll("textColor", { textColor: activeTextColor })}
                className="w-full flex items-center justify-center gap-1 rounded-lg border border-border bg-surface-raised py-1 text-[10px] font-semibold text-foreground hover:border-accent hover:text-accent cursor-pointer"
              >
                {copiedSection === "textColor" ? (
                  <span className="text-emerald-400">Text Color Applied to All!</span>
                ) : (
                  <span>Apply Text Color to All</span>
                )}
              </button>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SCRIPT & SCENES                                         */}
        {/* ============================================================== */}
        {activeTab === "script" && (
          <>
            <button
              type="button"
              onClick={onOpenAiGenerator}
              className="flex items-center justify-between rounded-xl border border-accent/60 bg-gradient-to-r from-accent/20 to-transparent p-3 text-left transition hover:border-accent group cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold shadow">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">AI Video Generator</div>
                  <div className="text-[10px] text-muted">Explain topics with auto-scenes</div>
                </div>
              </div>
            </button>

            {/* Presets */}
            <div>
              <div className="text-[11px] font-medium text-muted mb-1.5">Sample Presets</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onScriptChange(p.script)}
                    className="rounded-lg border border-border bg-surface-raised px-2 py-1 text-[11px] text-foreground hover:border-accent hover:text-accent transition cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Script */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted mb-1.5">
                <span>Narration Script</span>
                <span className="text-accent font-semibold">1 Line = 1 Scene</span>
              </div>
              <textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                rows={7}
                className="w-full resize-none rounded-lg border border-border/80 bg-surface-raised p-2.5 text-xs text-foreground focus:border-accent focus:outline-none font-[family-name:var(--font-kantumruy-pro)]"
                placeholder="Enter script with one sentence per line..."
              />
            </div>

            {/* Scene Duration Pacing */}
            <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">Scene Pacing</span>
                <span className="font-mono text-accent font-bold">{sceneDuration.toFixed(1)}s / scene</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={4.5}
                step={0.1}
                value={sceneDuration}
                onChange={(e) => onDurationChange(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CANVAS BACKGROUND (Full Video)                          */}
        {/* ============================================================== */}
        {activeTab === "canvas" && (
          <>
            <div>
              <div className="text-[11px] font-medium text-muted mb-1.5">Background Effect (Full Video)</div>
              <div className="grid grid-cols-4 gap-1 rounded-lg border border-border/80 bg-surface-raised p-1">
                {BG_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectBackgroundEffect(opt.id)}
                    className={`rounded py-1 text-xs font-medium transition cursor-pointer ${
                      activeBackground.style === opt.id
                        ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image upload */}
            {activeBackground.style === "image" && (
              <div className="rounded-xl border border-dashed border-border/80 p-3 text-center bg-surface-raised/30">
                {activeBackground.imageDataUrl ? (
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    <img src={activeBackground.imageDataUrl} alt="Background" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedBg = { style: "none" as const, imageDataUrl: null };
                        onUpdateGlobalBackground?.(updatedBg);
                        onApplyToAllScenes({ background: updatedBg });
                      }}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/80 p-1 text-white hover:bg-black cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs text-foreground hover:border-accent cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>Choose Background Image</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Background Color */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted mb-1.5">
                <span>Background Color</span>
                <input
                  type="color"
                  value={activeBgColor}
                  onChange={(e) => handleSelectBgColor(e.target.value)}
                  className="h-5 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {BG_COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => handleSelectBgColor(swatch.color)}
                    style={{ backgroundColor: swatch.color }}
                    className={`h-7 rounded-md border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                      activeBgColor.toLowerCase() === swatch.color.toLowerCase()
                        ? "border-accent ring-2 ring-accent"
                        : "border-border/80"
                    }`}
                  >
                    {activeBgColor.toLowerCase() === swatch.color.toLowerCase() && (
                      <Check size={12} className={swatch.color === "#FFFFFF" ? "text-black" : "text-white"} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AUDIOS / VOICEOVER                                      */}
        {/* ============================================================== */}
        {activeTab === "audio" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">Scene #{activeSceneIndex + 1} Voiceover</span>
                <button
                  type="button"
                  onClick={() => onOpenRecordModal?.(activeSceneIndex)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow transition cursor-pointer"
                >
                  <Mic size={12} />
                  <span>{scene?.audioUrl ? "Re-record" : "Record Voice"}</span>
                </button>
              </div>

              {scene?.audioUrl ? (
                <div className="text-[11px] text-emerald-400 font-mono">
                  ✓ Recorded ({scene.audioDurationSeconds || scene.durationSeconds}s)
                </div>
              ) : (
                <div className="text-[11px] text-muted">
                  No voiceover recorded for this scene yet. Click to record or upload your voice.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: UPLOADS & MEDIA ASSETS                                  */}
        {/* ============================================================== */}
        {activeTab === "uploads" && <UploadsPanel />}

        {/* Reset button at bottom of drawer */}
        <div className="pt-2 border-t border-border/60 mt-auto flex items-center justify-between">
          <span className="text-[10px] text-muted">Scene {activeSceneIndex + 1} of {scenes.length}</span>
          <button
            type="button"
            onClick={() => onResetScene(activeSceneIndex)}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset Scene</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
