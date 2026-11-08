import React, { useEffect, useState } from "react";
import type { TextMotionPresetDef } from "./types";
import { computeTextMotion } from "./engine";
import { getDefaultMotionConfig } from "./presets";

interface PresetThumbnailProps {
  preset: TextMotionPresetDef;
  isSelected?: boolean;
}

export function PresetThumbnail({ preset, isSelected = false }: PresetThumbnailProps) {
  // Mini animation loop for the thumbnail preview (0 to 60 frames, 30fps = 2 sec loop)
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let animId: number;
    let start = performance.now();

    const loop = (now: number) => {
      const elapsedSec = (now - start) / 1000;
      const f = Math.floor((elapsedSec * 30) % 60);
      setFrame(f);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const config = getDefaultMotionConfig(preset.id);
  const result = computeTextMotion(preset.id, frame, 30, 60, config, "Abc");

  return (
    <div className="relative h-12 w-full flex items-center justify-center overflow-hidden rounded-lg">
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: isSelected ? "#f1591f" : "#e2e8f0",
          ...result.style,
        }}
      >
        {result.renderedContent ?? "Abc"}
      </div>
    </div>
  );
}
