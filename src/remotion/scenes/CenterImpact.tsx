import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { moulFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

export function CenterImpact({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.3,
  fontSize = 88,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.5 },
  });

  const overshoot = interpolate(scale, [0, 0.7, 1], [0.7, 1.05, 1]);
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const effectiveBg = backgroundColor ?? "#FFFFFF";
  const effectiveText = textColor ?? (isColorDark(effectiveBg) ? "#FFFFFF" : "#000000");

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg }}>
      <SceneBackground {...background} isDark={isColorDark(effectiveBg)} />
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill
        style={{
          alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          justifyContent: "center",
          padding: 120,
          transform: `translate(${positionX}px, ${positionY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: moulFontFamily,
            fontSize,
            color: effectiveText,
            textAlign,
            lineHeight,
            transform: `scale(${overshoot})`,
            opacity,
            maxWidth: "90%",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
