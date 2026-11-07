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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            type="button"
            onClick={() => onScriptChange(preset.script)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 text-sm border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            {preset.title}
          </motion.button>
        ))}
      </div>

      <textarea
        value={script}
        onChange={(event) => onScriptChange(event.target.value)}
        placeholder="សរសេរអត្ថបទខ្មែររបស់អ្នកនៅទីនេះ..."
        rows={10}
        className="w-full resize-none border-2 border-black rounded-lg p-4 font-[family-name:var(--font-kantumruy-pro)] text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-black"
      />

      <div className="flex items-center justify-between text-sm text-neutral-700">
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
            className="accent-black"
          />
          <span className="w-16 text-right">{wpm} wpm</span>
        </label>
      </div>
    </div>
  );
}
