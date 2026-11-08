import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { TextMotionConfig } from "./types";
import { computeTextMotion } from "./engine";
import { getDefaultMotionConfig } from "./presets";

export interface MotionTextProps {
  text: string;
  config?: TextMotionConfig;
  presetId?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  durationInFrames?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MotionText({
  text,
  config,
  presetId,
  fontFamily,
  fontSize = 88,
  color = "#FFFFFF",
  textAlign = "center",
  lineHeight = 1.3,
  durationInFrames: customDurationInFrames,
  className = "",
  style: userStyle = {},
}: MotionTextProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: configDurationInFrames } = useVideoConfig();

  const totalDuration = customDurationInFrames ?? configDurationInFrames ?? 90;

  // Resolve config: either explicit config or default from presetId
  const effectiveConfig = config ?? getDefaultMotionConfig(presetId ?? "pop-up");

  const motionResult = computeTextMotion(
    effectiveConfig.presetId,
    frame,
    fps,
    totalDuration,
    effectiveConfig,
    text
  );

  const containerStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    color,
    textAlign,
    lineHeight,
    maxWidth: "92%",
    wordBreak: "break-word",
    ...userStyle,
    ...motionResult.style,
  };

  if (motionResult.renderedContent) {
    return (
      <div className={className} style={containerStyle}>
        {motionResult.renderedContent}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {text}
    </div>
  );
}
