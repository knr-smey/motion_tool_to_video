"use client";

import { motion } from "framer-motion";
import { PRESETS } from "@/lib/presets";

interface ScriptInputProps {
  script: string;
  wordCount: number;
  wpm: number;
  onScriptChange: (script: string) => void;
  onWpmChange: (wpm: number) => void;
}

export function ScriptInput({
  script,
  wordCount,
  wpm,
  onScriptChange,
  onWpmChange,
}: ScriptInputProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4">
      <div>
        <h2 className="text-sm font-semibold">Script</h2>
        <p className="text-xs text-muted mt-0.5">Khmer text, broken into scenes automatically.</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => onScriptChange(preset.script)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {preset.title}
            </motion.button>
          ))}
        </div>
      </div>

      <textarea
        value={script}
        onChange={(event) => onScriptChange(event.target.value)}
        placeholder="សរសេរអត្ថបទខ្មែររបស់អ្នកនៅទីនេះ..."
        rows={10}
        className="w-full resize-none rounded-lg border border-border bg-surface-raised p-4 font-[family-name:var(--font-kantumruy-pro)] text-lg leading-relaxed text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-muted">
        <span>{wordCount} words</span>

        <label className="flex items-center gap-2">
          <span>Pace</span>
          <input
            type="range"
            min={120}
            max={180}
            step={5}
            value={wpm}
            onChange={(event) => onWpmChange(Number(event.target.value))}
            className="accent-accent"
          />
          <span className="w-16 text-right tabular-nums">{wpm} wpm</span>
        </label>
      </div>
    </div>
  );
}
