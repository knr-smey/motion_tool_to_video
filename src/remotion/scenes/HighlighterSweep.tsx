import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { battambangFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

export function HighlighterSweep({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.35,
  fontSize = 76,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();

  // Smooth left-to-right wipe reveal without any flashing blocks or difference-blend rectangles
  const wipeProgress = interpolate(frame, [0, 16], [0, 100], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const effectiveBg = backgroundColor === "transparent" ? "transparent" : (backgroundColor ?? "#000000");
  const effectiveText = textColor ?? (isColorDark(effectiveBg === "transparent" ? "#000000" : effectiveBg) ? "#FFFFFF" : "#000000");

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg }}>
      {background?.style && background.style !== "none" && (
        <SceneBackground {...background} isDark={isColorDark(effectiveBg)} />
      )}
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
            position: "relative",
            fontFamily: `${poppinsFontFamily}, ${battambangFontFamily}, sans-serif`,
            fontWeight: 700,
            fontSize,
            textAlign,
            lineHeight,
            color: effectiveText,
            opacity,
            clipPath: `inset(0 ${100 - wipeProgress}% 0 0)`,
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
