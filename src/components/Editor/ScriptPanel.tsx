"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, Sliders, Clock, Layers, Plus } from "lucide-react";
import { PRESETS } from "@/lib/presets";
import type { Scene } from "@/lib/segmentation";
import { LAYOUT_THEME } from "@/lib/layoutTheme";

interface ScriptPanelProps {
  script: string;
  wordCount: number;
  wpm: number;
  scenes: Scene[];
  activeSceneIndex: number;
  onScriptChange: (script: string) => void;
  onWpmChange: (wpm: number) => void;
  onSelectScene: (index: number) => void;
}

export function ScriptPanel({
  script,
  wordCount,
  wpm,
  scenes,
  activeSceneIndex,
  onScriptChange,
  onWpmChange,
  onSelectScene,
}: ScriptPanelProps) {
  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="flex flex-col gap-4 p-4 text-foreground">
      {/* 1. Header & Stats */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-accent" />
            <h2 className="text-sm font-semibold">Script & Story</h2>
          </div>
          <span className="text-[11px] font-medium text-accent bg-accent/15 px-2 py-0.5 rounded-full">
            Khmer Engine
          </span>
        </div>

        <p className="text-xs text-muted mb-3">
          Type or edit Khmer narration. It will be segmented into timed motion scenes automatically.
        </p>

        {/* Stats chips */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
          <div className="rounded-lg bg-surface-raised p-2">
            <div className="text-[10px] text-muted uppercase tracking-wider">Words</div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{wordCount}</div>
          </div>
          <div className="rounded-lg bg-surface-raised p-2">
            <div className="text-[10px] text-muted uppercase tracking-wider">Scenes</div>
            <div className="text-sm font-semibold tabular-nums text-foreground">
              {scenes.length}
            </div>
          </div>
          <div className="rounded-lg bg-surface-raised p-2">
            <div className="text-[10px] text-muted uppercase tracking-wider">Duration</div>
            <div className="text-sm font-semibold tabular-nums text-foreground">
              {totalSeconds.toFixed(1)}s
            </div>
          </div>
        </div>
      </div>

      {/* 2. Presets */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Sample Presets
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => onScriptChange(preset.script)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {preset.title}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3. Script Input Textarea */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Narration Text
          </label>
          <span className="text-[11px] text-muted">Khmer unicode</span>
        </div>

        <textarea
          value={script}
          onChange={(event) => onScriptChange(event.target.value)}
          placeholder="សរសេរអត្ថបទខ្មែររបស់អ្នកនៅទីនេះ... (ចុច Enter ដើម្បីបង្កើតឈុតថ្មី)"
          rows={9}
          className="w-full resize-none rounded-lg border border-border bg-surface-raised p-3.5 font-[family-name:var(--font-kantumruy-pro)] text-base leading-relaxed text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <p className="text-[11px] text-muted">
          💡 <span className="text-foreground/90 font-medium">1 Line = 1 Scene:</span> Each line separated by <kbd className="rounded bg-surface px-1 py-0.5 font-mono text-[10px] border border-border">Enter</kbd> creates exactly 1 scene.
        </p>

        {/* Pace Slider */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-muted mt-1">
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>Pace</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={120}
              max={180}
              step={5}
              value={wpm}
              onChange={(event) => onWpmChange(Number(event.target.value))}
              className="w-24 accent-accent cursor-pointer"
            />
            <span className="w-14 text-right tabular-nums text-foreground font-mono">
              {wpm} wpm
            </span>
          </div>
        </div>
      </div>

      {/* 4. Generated Scene Breakdown Navigator */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Scenes Breakdown ({scenes.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const defaultNewScene = "អត្ថបទឈុតថ្មី...";
              const updated = script.trim() ? `${script.trim()}\n${defaultNewScene}` : defaultNewScene;
              onScriptChange(updated);
              onSelectScene(scenes.length);
            }}
            className="flex items-center gap-1 rounded bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent hover:bg-accent/25 transition"
            title="Add a new scene line"
          >
            <Plus size={12} />
            <span>Add Scene</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {scenes.map((sc, index) => {
            const isSelected = index === activeSceneIndex;
            const theme = LAYOUT_THEME[sc.layout];

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectScene(index)}
                className={`group flex flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/15 ring-1 ring-accent text-foreground shadow-sm"
                    : "border-border bg-surface-raised text-muted hover:border-border hover:text-foreground"
                }`}
              >
                <div className="flex w-full items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-[11px] text-foreground">
                      {theme?.label ?? sc.layout}
                    </span>
                  </div>
                  <span className="tabular-nums text-[11px] text-muted font-mono">
                    {sc.durationSeconds.toFixed(1)}s
                  </span>
                </div>

                <p className="line-clamp-2 text-xs font-[family-name:var(--font-kantumruy-pro)] leading-snug text-foreground/90">
                  {sc.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
